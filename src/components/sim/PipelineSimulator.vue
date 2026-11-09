<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import {
  runPipeline,
  stageLabel,
  stageOrder,
  type Commit,
  type Release,
  type StageId,
  type StageStatus,
} from "../../lib/pipeline";

const commits: Commit[] = [
  { id: "feat", label: "/goodbye ルートを追加", buggy: false },
  { id: "bug", label: "/hello の返り値を書き換え（うっかりバグ入り）", buggy: true },
  { id: "fix", label: "/hello のバグを修正", buggy: false },
];

const withTests = ref(false);
const production = ref<Release>({ version: 1, label: "最初のリリース", healthy: true });
const stages = ref<Record<StageId, StageStatus>>(blankStages());
const running = ref(false);
const message = ref("");
const history = ref<{ commit: string; withTests: boolean; deployed: boolean; healthy: boolean }[]>(
  [],
);

let timers: ReturnType<typeof setTimeout>[] = [];
onBeforeUnmount(() => timers.forEach(clearTimeout));

function blankStages(): Record<StageId, StageStatus> {
  return { push: "pending", install: "pending", test: "pending", deploy: "pending" };
}

function push(commit: Commit) {
  if (running.value) return;
  const result = runPipeline(commit, production.value, withTests.value);
  running.value = true;
  message.value = "";
  stages.value = blankStages();

  // 結果は先に計算済み。各ステージを順番に「実行中 → 結果」と見せる
  let t = 0;
  let stopped = false;
  for (const id of stageOrder) {
    const final = result.stages[id];
    if (stopped || final === "skipped") {
      timers.push(setTimeout(() => (stages.value[id] = "skipped"), t));
      continue;
    }
    timers.push(setTimeout(() => (stages.value[id] = "running"), t));
    t += id === "test" ? 1400 : 800;
    timers.push(setTimeout(() => (stages.value[id] = final), t));
    if (final === "failure") stopped = true;
  }
  timers.push(
    setTimeout(() => {
      const deployed = result.stages.deploy === "success";
      production.value = result.production;
      message.value = result.message;
      history.value.unshift({
        commit: commit.label,
        withTests: withTests.value,
        deployed,
        healthy: result.production.healthy,
      });
      running.value = false;
    }, t + 200),
  );
}

function reset() {
  timers.forEach(clearTimeout);
  timers = [];
  production.value = { version: 1, label: "最初のリリース", healthy: true };
  stages.value = blankStages();
  running.value = false;
  message.value = "";
  history.value = [];
}

const statusStyle: Record<StageStatus, string> = {
  pending: "border-slate-200 bg-white text-slate-400",
  running: "border-amber-400 bg-amber-50 text-amber-800 animate-pulse",
  success: "border-emerald-500 bg-emerald-50 text-emerald-800",
  failure: "border-rose-500 bg-rose-50 text-rose-800",
  skipped: "border-dashed border-slate-300 bg-slate-50 text-slate-400",
};
const statusIcon: Record<StageStatus, string> = {
  pending: "○",
  running: "…",
  success: "✓",
  failure: "✗",
  skipped: "–",
};
</script>

<template>
  <div class="not-prose my-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="flex items-center justify-between">
      <label class="flex cursor-pointer items-center gap-3 text-sm font-semibold">
        <span
          class="relative h-6 w-11 rounded-full transition"
          :class="withTests ? 'bg-emerald-500' : 'bg-slate-300'"
        >
          <input v-model="withTests" type="checkbox" class="sr-only" :disabled="running" />
          <span
            class="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition"
            :class="withTests ? 'translate-x-5' : ''"
          />
        </span>
        ワークフローにテスト（CI）を入れる
      </label>
      <button type="button" class="text-xs text-slate-400 underline" @click="reset">
        リセット
      </button>
    </div>

    <!-- パイプライン -->
    <div class="mt-6 flex items-center">
      <template v-for="(id, i) in stageOrder" :key="id">
        <div
          class="flex w-28 flex-col items-center rounded-xl border-2 px-3 py-3 transition"
          :class="statusStyle[stages[id]]"
        >
          <span class="text-lg font-bold">{{ statusIcon[stages[id]] }}</span>
          <span class="text-sm font-bold">{{ stageLabel[id] }}</span>
          <span v-if="id === 'test' && !withTests" class="text-[10px]">なし</span>
        </div>
        <div v-if="i < stageOrder.length - 1" class="h-0.5 flex-1 bg-slate-200" />
      </template>
      <div class="h-0.5 w-6 bg-slate-200" />
      <div
        class="flex w-36 flex-col items-center rounded-xl border-2 px-3 py-3 text-center"
        :class="production.healthy ? 'border-sky-400 bg-sky-50' : 'border-rose-500 bg-rose-100'"
      >
        <span class="text-xs font-bold text-slate-500">本番環境</span>
        <span class="text-lg font-bold">v{{ production.version }}</span>
        <span class="text-[11px]" :class="production.healthy ? 'text-sky-800' : 'text-rose-700'">
          {{ production.healthy ? "正常に動作中" : "🔥 エラー発生中" }}
        </span>
      </div>
    </div>

    <p
      v-if="message"
      class="mt-4 rounded-lg px-4 py-3 text-sm"
      :class="production.healthy ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'"
      role="status"
    >
      {{ message }}
    </p>

    <div class="mt-6 text-xs font-bold text-slate-500">変更を選んで Push する</div>
    <div class="mt-2 grid gap-2">
      <button
        v-for="c in commits"
        :key="c.id"
        type="button"
        class="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-2.5 text-left text-sm hover:border-brand-500 disabled:opacity-50"
        :disabled="running"
        @click="push(c)"
      >
        <span class="font-mono">git push — {{ c.label }}</span>
        <span
          v-if="c.buggy"
          class="rounded bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700"
          >バグあり</span
        >
      </button>
    </div>

    <div v-if="history.length" class="mt-6">
      <div class="text-xs font-bold text-slate-500">実行履歴</div>
      <ul class="mt-2 space-y-1 text-xs">
        <li v-for="(h, i) in history" :key="i" class="flex gap-3">
          <span class="w-20 text-slate-500">{{ h.withTests ? "CI/CD" : "CDのみ" }}</span>
          <span class="flex-1">{{ h.commit }}</span>
          <span :class="h.deployed ? 'text-brand-700' : 'text-slate-500'">{{
            h.deployed ? "デプロイした" : "デプロイを止めた"
          }}</span>
          <span class="w-20 text-right" :class="h.healthy ? 'text-emerald-700' : 'text-rose-700'">{{
            h.healthy ? "本番 正常" : "本番 障害"
          }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
