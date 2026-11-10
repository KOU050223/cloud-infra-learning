import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import { sleep } from "../lib/motion";
import {
  presets,
  promptPath,
  run,
  suggest,
  type CodeVariant,
  type ShellState,
  type Tone,
} from "../lib/shell";

export interface TermLine {
  id: number;
  kind: "cmd" | "out" | "note";
  text: string;
  tone?: Tone;
  /** cmd のときのプロンプト */
  cwd?: string;
}

export const codeLabels: Record<CodeVariant, string> = {
  ok: "正常",
  typo: "jsn の打ち間違い",
  hi: "Hi に変更",
};

/**
 * ターミナルのシミュレーター。レッスンをまたいで状態を引き継ぐ（保存はしない）。
 */
export const useTerminalStore = defineStore("terminal", () => {
  const state = ref<ShellState>(presets.fresh());
  const lines = ref<TermLine[]>([]);
  const history = ref<string[]>([]);
  /** このページでターミナルが使えるか */
  const available = ref(false);
  const open = ref(false);
  const busy = ref(false);
  let nextId = 0;
  let queue: string[] = [];

  const prompt = computed(() => promptPath(state.value));
  const suggestions = computed(() => suggest(state.value));

  function push(line: Omit<TermLine, "id">) {
    lines.value.push({ ...line, id: nextId++ });
    if (lines.value.length > 400) lines.value.splice(0, lines.value.length - 400);
  }

  async function exec(cmd: string) {
    push({ kind: "cmd", text: cmd, cwd: prompt.value });
    if (cmd.trim()) history.value.push(cmd);
    const r = run(state.value, cmd);
    state.value = r.state;
    if (r.clear) {
      lines.value = [];
      return;
    }
    for (const l of r.lines) {
      if (l.delay) await sleep(l.delay);
      push({ kind: l.tone === "hint" ? "note" : "out", text: l.text, tone: l.tone });
    }
  }

  async function drain() {
    if (busy.value) return;
    busy.value = true;
    try {
      while (queue.length && !state.value.selectingTemplate) {
        const cmd = queue.shift()!;
        await exec(cmd);
        if (queue.length) await sleep(250);
      }
    } finally {
      busy.value = false;
    }
  }

  /** コマンドを実行する（実行中なら順番待ち） */
  function send(cmds: string | string[]) {
    open.value = true;
    const list = (Array.isArray(cmds) ? cmds : cmds.split("\n"))
      .map((c) => c.trim())
      .filter((c) => c && !c.startsWith("#"));
    queue.push(...list);
    void drain();
  }

  async function selectTemplate(template: string) {
    if (busy.value || !state.value.selectingTemplate) return;
    busy.value = true;
    try {
      const r = run(state.value, template);
      state.value = r.state;
      for (const l of r.lines) {
        if (l.delay) await sleep(l.delay);
        push({ kind: l.tone === "hint" ? "note" : "out", text: l.text, tone: l.tone });
      }
    } finally {
      busy.value = false;
    }
    if (!state.value.selectingTemplate) void drain();
  }

  function interrupt() {
    queue = [];
    if (state.value.selectingTemplate) state.value = { ...state.value, selectingTemplate: false };
    push({ kind: "cmd", text: "^C", cwd: prompt.value });
    if (state.value.devRunning) {
      state.value = { ...state.value, devRunning: false };
      push({ kind: "note", text: "dev サーバーを止めました。", tone: "hint" });
    }
  }

  function setCode(code: CodeVariant) {
    if (state.value.code === code) return;
    state.value = { ...state.value, code, dirty: true, staged: false };
    push({
      kind: "note",
      text: `src/index.ts を「${codeLabels[code]}」に書き換えました。`,
      tone: "hint",
    });
  }

  function reset(preset: keyof typeof presets) {
    queue = [];
    state.value = presets[preset]();
    lines.value = [];
    push({
      kind: "note",
      tone: "hint",
      text:
        preset === "fresh"
          ? "何もしていない状態から始めます。help で使えるコマンドを表示します。"
          : "第1回を終えた状態（my-api を公開済み・ログイン済み）から始めます。",
    });
  }

  return {
    state,
    lines,
    history,
    available,
    open,
    busy,
    prompt,
    suggestions,
    send,
    selectTemplate,
    interrupt,
    setCode,
    reset,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTerminalStore, import.meta.hot));
}
