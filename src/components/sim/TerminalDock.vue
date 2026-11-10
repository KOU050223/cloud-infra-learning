<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from "vue";
import { complete } from "../../lib/shell";
import { codeLabels, useTerminalStore } from "../../stores/terminal";
import AppIcon from "../icons/AppIcon.vue";
import type { CodeVariant } from "../../lib/shell";

/**
 * 画面右下に常駐するターミナルのシミュレーター。
 * コードブロックの「試す」から送られたコマンドもここで実行する。
 */
const term = useTerminalStore();
const input = ref("");
const histIndex = ref<number | null>(null);
const scroller = useTemplateRef<HTMLDivElement>("scroller");
const field = useTemplateRef<HTMLInputElement>("field");

onMounted(() => {
  term.available = true;
  if (!term.lines.length) term.reset("fresh");
});
onBeforeUnmount(() => {
  term.available = false;
});

// 出力が増えたら一番下までスクロール
watch(
  () => term.lines.length,
  async () => {
    await nextTick();
    scroller.value?.scrollTo({ top: scroller.value.scrollHeight, behavior: "smooth" });
  },
);
watch(
  () => term.open,
  async (o) => {
    if (!o) return;
    await nextTick();
    scroller.value?.scrollTo({ top: scroller.value.scrollHeight });
    field.value?.focus({ preventScroll: true });
  },
);

function submit() {
  if (term.busy) return;
  const cmd = input.value;
  input.value = "";
  histIndex.value = null;
  term.send([cmd || " "]);
}

function onKey(e: KeyboardEvent) {
  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    const h = term.history;
    if (!h.length) return;
    e.preventDefault();
    let i = histIndex.value ?? h.length;
    i = e.key === "ArrowUp" ? Math.max(0, i - 1) : Math.min(h.length, i + 1);
    histIndex.value = i === h.length ? null : i;
    input.value = h[i] ?? "";
  } else if (e.key === "Tab") {
    e.preventDefault();
    const c = complete(input.value);
    if (c) input.value = c;
  } else if (e.key === "c" && e.ctrlKey) {
    e.preventDefault();
    input.value = "";
    term.interrupt();
  } else if (e.key === "l" && e.ctrlKey) {
    e.preventDefault();
    term.lines = [];
  }
}

const toneClass: Record<string, string> = {
  out: "text-white/85",
  muted: "text-white/40",
  ok: "text-ok",
  err: "text-ng",
  warn: "text-signal",
  accent: "text-cool",
};

const variants = Object.keys(codeLabels) as CodeVariant[];
</script>

<template>
  <div class="fixed right-6 bottom-6 z-40 flex flex-col items-end gap-3">
    <Transition name="dock">
      <section
        v-if="term.open"
        class="flex h-[min(480px,calc(100vh-7rem))] w-[min(640px,calc(100vw-3rem))] flex-col overflow-hidden rounded-3xl bg-[oklch(0.17_0.02_265)] text-white shadow-[0_30px_80px_-20px_oklch(0.2_0.05_265_/_0.6)] ring-1 ring-white/10"
        aria-label="ターミナルのシミュレーター"
      >
        <!-- ヘッダー -->
        <header class="flex items-center gap-3 border-b border-white/10 px-5 py-3">
          <span class="flex gap-1.5">
            <span class="size-3 rounded-full bg-[#ff5f57]" />
            <span class="size-3 rounded-full bg-[#febc2e]" />
            <span class="size-3 rounded-full bg-[#28c840]" />
          </span>
          <span class="font-mono text-xs text-white/50">zsh — シミュレーター</span>
          <span class="ml-auto flex items-center gap-1">
            <button
              type="button"
              class="rounded-lg px-2.5 py-1 text-xs text-white/50 transition hover:bg-white/10 hover:text-white"
              @click="term.reset('fresh')"
            >
              最初から
            </button>
            <button
              type="button"
              class="rounded-lg px-2.5 py-1 text-xs text-white/50 transition hover:bg-white/10 hover:text-white"
              @click="term.reset('published')"
            >
              公開済みから
            </button>
            <button
              type="button"
              class="ml-1 rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
              aria-label="ターミナルを閉じる"
              @click="term.open = false"
            >
              <AppIcon name="minus" :size="16" :stroke="2" />
            </button>
          </span>
        </header>

        <!-- src/index.ts の中身 -->
        <div
          v-if="term.state.cloned"
          class="flex flex-wrap items-center gap-2 border-b border-white/10 bg-white/[0.03] px-5 py-2 text-xs"
        >
          <span class="font-mono text-white/45">src/index.ts</span>
          <button
            v-for="v in variants"
            :key="v"
            type="button"
            class="rounded-full px-2.5 py-0.5 transition"
            :class="
              term.state.code === v
                ? v === 'ok'
                  ? 'bg-ok text-stage'
                  : 'bg-signal text-stage'
                : 'text-white/55 ring-1 ring-white/15 hover:text-white'
            "
            :aria-pressed="term.state.code === v"
            @click="term.setCode(v)"
          >
            {{ codeLabels[v] }}
          </button>
          <span v-if="term.state.devRunning" class="ml-auto flex items-center gap-1.5 text-ok">
            <span class="size-1.5 animate-pulse rounded-full bg-ok" />dev :8787
          </span>
        </div>

        <!-- 出力 -->
        <div
          ref="scroller"
          class="flex-1 overflow-y-auto px-5 py-4 font-mono text-[12.5px] leading-[1.75]"
        >
          <div v-for="l in term.lines" :key="l.id" class="term-line whitespace-pre-wrap">
            <template v-if="l.kind === 'cmd'">
              <span class="text-cool">{{ l.cwd }}</span>
              <span class="text-signal"> $ </span>
              <span class="text-white">{{ l.text }}</span>
            </template>
            <div
              v-else-if="l.kind === 'note'"
              class="my-1.5 flex gap-2 rounded-lg bg-signal/10 px-3 py-1.5 font-sans text-[12.5px] leading-relaxed text-signal"
            >
              <AppIcon name="bulb" :size="14" :stroke="2" class="mt-0.5" />
              <span>{{ l.text }}</span>
            </div>
            <span v-else :class="toneClass[l.tone ?? 'out']">{{ l.text || " " }}</span>
          </div>

          <!-- 入力行 -->
          <form class="flex items-center" @submit.prevent="submit">
            <span class="text-cool">{{ term.prompt }}</span>
            <span class="text-signal">&nbsp;$&nbsp;</span>
            <input
              ref="field"
              v-model="input"
              class="min-w-0 flex-1 bg-transparent text-white caret-signal outline-none"
              spellcheck="false"
              autocomplete="off"
              autocapitalize="off"
              aria-label="コマンドを入力"
              :disabled="term.busy"
              @keydown="onKey"
            />
            <span
              v-if="term.busy"
              class="spin-fast ml-2 size-3 rounded-full border-2 border-signal border-t-transparent"
            />
          </form>
        </div>

        <!-- 次に試すコマンド -->
        <footer class="flex flex-wrap items-center gap-2 border-t border-white/10 px-5 py-3">
          <span class="text-[11px] font-bold tracking-wider text-white/35">次に試す</span>
          <button
            v-for="c in term.suggestions"
            :key="c"
            type="button"
            class="max-w-full truncate rounded-lg bg-white/[0.06] px-2.5 py-1 font-mono text-[11.5px] text-white/75 ring-1 ring-white/10 transition hover:bg-white/[0.12] hover:text-white disabled:opacity-40"
            :disabled="term.busy"
            @click="term.send(c)"
          >
            {{ c }}
          </button>
          <span class="ml-auto hidden text-[11px] text-white/30 sm:inline"
            >↑↓ 履歴 · Tab 補完 · Ctrl+C 停止</span
          >
        </footer>
      </section>
    </Transition>

    <button
      type="button"
      class="group flex items-center gap-2.5 rounded-full bg-ink py-3 pr-5 pl-4 font-bold text-white shadow-[0_14px_40px_-12px_oklch(0.2_0.05_265_/_0.7)] transition hover:-translate-y-0.5 hover:bg-brand-700"
      :aria-expanded="term.open"
      @click="term.open = !term.open"
    >
      <span class="relative flex">
        <AppIcon name="terminal" :size="20" class="text-signal" />
        <span
          v-if="term.busy && !term.open"
          class="absolute -top-1 -right-1 size-2.5 animate-ping rounded-full bg-signal"
        />
      </span>
      {{ term.open ? "閉じる" : "ターミナル" }}
    </button>
  </div>
</template>

<style scoped>
.term-line {
  animation: term-in 0.18s ease-out both;
}
@keyframes term-in {
  from {
    opacity: 0;
    transform: translateY(3px);
  }
}
.dock-enter-active,
.dock-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1.2);
  transform-origin: bottom right;
}
.dock-enter-from,
.dock-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}
</style>
