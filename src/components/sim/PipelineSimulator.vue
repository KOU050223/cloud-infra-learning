<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import { isAbort, sleep, travelAlong, tween, type Point } from "../../lib/motion";
import {
  runPipeline,
  stageLabel,
  stageOrder,
  type Commit,
  type Release,
  type StageId,
  type StageStatus,
} from "../../lib/pipeline";
import AppIcon from "../icons/AppIcon.vue";
import BrandIcon from "../icons/BrandIcon.vue";
import type { BrandName } from "../icons/brands";
import type { IconName } from "../icons/icons";

const commits: (Commit & { icon: IconName; detail: string })[] = [
  {
    id: "feat",
    label: "/goodbye ルートを追加",
    detail: "正しく書けた新機能",
    breakage: "none",
    icon: "plus",
  },
  {
    id: "typo",
    label: "c.json を c.jsn と打ち間違え",
    detail: "存在しない関数を呼んでいる",
    breakage: "type",
    icon: "alert",
  },
  {
    id: "wrong",
    label: "あいさつを Hello → Hi に変更",
    detail: "コードは正しいが仕様と違う",
    breakage: "behavior",
    icon: "question",
  },
  {
    id: "fix",
    label: "打ち間違い・文言を元に戻す",
    detail: "不具合の修正",
    breakage: "none",
    icon: "check",
  },
];

const breakageTag: Record<Commit["breakage"], { text: string; cls: string } | null> = {
  none: null,
  type: { text: "型エラー", cls: "bg-rose-50 text-rose-600" },
  behavior: { text: "動作の不具合", cls: "bg-amber-50 text-amber-700" },
};

const Y = 140;
const xs = { dev: 70, push: 215, install: 365, build: 515, deploy: 665, prod: 805 } as const;
const stageIcon: Record<StageId, IconName> = {
  push: "upload",
  install: "box",
  build: "layers",
  deploy: "rocket",
};
const stageBrand: Record<StageId, BrandName> = {
  push: "github",
  install: "npm",
  build: "typescript",
  deploy: "cloudflareworkers",
};
const stageSub: Record<StageId, string> = {
  push: "to GitHub",
  install: "npm ci",
  build: "npm run build",
  deploy: "wrangler deploy",
};

/** 隣り合うノードをゆるい波でつなぐ */
const points = [xs.dev, xs.push, xs.install, xs.build, xs.deploy, xs.prod];
const segments = points.slice(0, -1).map((x, i) => {
  const x2 = points[i + 1]!;
  const a = x + 38;
  const b = x2 - (i === points.length - 2 ? 62 : 38);
  const bend = i % 2 === 0 ? -18 : 18;
  return `M${a} ${Y} C ${a + (b - a) / 3} ${Y + bend}, ${a + ((b - a) * 2) / 3} ${Y + bend}, ${b} ${Y}`;
});
const segEls: SVGPathElement[] = [];
function setSeg(i: number, el: unknown) {
  if (el instanceof SVGPathElement) segEls[i] = el;
}

const withCheck = ref(false);
const production = ref<Release>({ version: 1, label: "最初のリリース", healthy: true });
const stages = ref<Record<StageId, StageStatus>>(blankStages());
const litSegments = ref(0); // 走り終えた区間の数
const running = ref(false);
const message = ref("");
const deployFlash = ref(0);
const history = ref<
  { id: number; commit: string; withCheck: boolean; deployed: boolean; healthy: boolean }[]
>([]);
let runId = 0;

const packet = ref<{
  visible: boolean;
  at: Point;
  trail: Point[];
  opacity: number;
  buggy: boolean;
}>({ visible: false, at: { x: 0, y: 0 }, trail: [], opacity: 1, buggy: false });

let ac: AbortController | null = null;
onBeforeUnmount(() => ac?.abort());

function blankStages(): Record<StageId, StageStatus> {
  return { push: "pending", install: "pending", build: "pending", deploy: "pending" };
}

async function travel(i: number, signal: AbortSignal) {
  const el = segEls[i];
  if (!el) return;
  await travelAlong(
    el,
    650,
    (p, trail) => {
      packet.value.at = p;
      packet.value.trail = trail;
    },
    { signal, trailLength: 12 },
  );
  packet.value.trail = [];
  litSegments.value = i + 1;
}

async function animate(commit: Commit, signal: AbortSignal) {
  const result = runPipeline(commit, production.value, withCheck.value);
  stages.value = blankStages();
  litSegments.value = 0;
  message.value = "";
  packet.value = {
    visible: true,
    at: { x: xs.dev + 38, y: Y },
    trail: [],
    opacity: 1,
    buggy: commit.breakage !== "none",
  };

  let seg = 0;
  for (const id of stageOrder) {
    await travel(seg++, signal);
    const final = result.stages[id];
    if (final === "skipped") {
      stages.value[id] = "skipped";
      continue;
    }
    stages.value[id] = "running";
    await sleep(id === "build" ? 1500 : 650, signal);
    stages.value[id] = final;
    if (final === "failure") {
      // パケットが線路から落ちて消える
      const from = { ...packet.value.at };
      await tween(
        700,
        (t) => {
          packet.value.at = { x: from.x + 20 * t, y: from.y + 90 * t * t };
          packet.value.opacity = 1 - t;
        },
        { signal },
      );
      packet.value.visible = false;
      break;
    }
    await sleep(200, signal);
  }

  const deployed = result.stages.deploy === "success";
  if (deployed) {
    await travel(seg, signal);
    packet.value.visible = false;
    deployFlash.value++;
  }
  production.value = result.production;
  message.value = result.message;
  history.value.unshift({
    id: ++runId,
    commit: commit.label,
    withCheck: withCheck.value,
    deployed,
    healthy: result.production.healthy,
  });
}

async function push(commit: Commit) {
  if (running.value) return;
  ac = new AbortController();
  running.value = true;
  try {
    await animate(commit, ac.signal);
  } catch (e) {
    if (!isAbort(e)) throw e;
  } finally {
    running.value = false;
  }
}

function reset() {
  ac?.abort();
  production.value = { version: 1, label: "最初のリリース", healthy: true };
  stages.value = blankStages();
  litSegments.value = 0;
  packet.value.visible = false;
  running.value = false;
  message.value = "";
  history.value = [];
}

const ringColor: Record<StageStatus, string> = {
  pending: "oklch(1 0 0 / 0.16)",
  running: "var(--color-signal)",
  success: "var(--color-ok)",
  failure: "var(--color-ng)",
  skipped: "oklch(1 0 0 / 0.2)",
};
</script>

<template>
  <div class="not-prose my-14 xl:-mx-20">
    <!-- 操作パネル -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <label class="flex cursor-pointer items-center gap-4 select-none">
        <span
          class="relative h-8 w-14 rounded-full transition-colors duration-300"
          :class="withCheck ? 'bg-emerald-500' : 'bg-ink/20'"
        >
          <input v-model="withCheck" type="checkbox" class="peer sr-only" :disabled="running" />
          <span
            class="absolute top-1 left-1 flex size-6 items-center justify-center rounded-full bg-white shadow transition-transform duration-300 peer-focus-visible:ring-4 peer-focus-visible:ring-brand-100"
            :class="withCheck ? 'translate-x-6 text-emerald-600' : 'text-ink/30'"
          >
            <AppIcon name="layers" :size="14" :stroke="2" />
          </span>
        </span>
        <span>
          <span class="block font-bold">ワークフローに build チェック（CI）を入れる</span>
          <span class="block text-sm text-ink/55">{{
            withCheck
              ? "CI/CD：型チェックに通ったものだけ公開"
              : "CD のみ：push したものがそのまま公開"
          }}</span>
        </span>
      </label>
      <button
        type="button"
        class="flex items-center gap-1.5 text-sm text-ink/45 transition hover:text-ink"
        @click="reset"
      >
        <AppIcon name="replay" :size="15" :stroke="2" />リセット
      </button>
    </div>

    <!-- ステージ -->
    <div class="stage mt-6">
      <svg viewBox="0 0 900 300" class="block w-full" role="img" aria-label="CI/CD パイプライン">
        <defs>
          <filter id="ps-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <radialGradient id="ps-node" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stop-color="oklch(0.34 0.05 265)" />
            <stop offset="100%" stop-color="oklch(0.24 0.035 265)" />
          </radialGradient>
        </defs>

        <!-- GitHub Actions の実行範囲 -->
        <g>
          <rect
            x="168"
            y="52"
            width="545"
            height="190"
            rx="22"
            fill="oklch(1 0 0 / 0.025)"
            stroke="oklch(0.7 0.15 255 / 0.45)"
            stroke-dasharray="6 6"
            class="wire-flow"
            style="animation-duration: 6s"
          />
          <g transform="translate(186 38)">
            <rect
              x="-8"
              y="0"
              width="186"
              height="28"
              rx="14"
              fill="var(--color-stage)"
              stroke="oklch(0.7 0.15 255 / 0.45)"
            />
            <BrandIcon name="githubactions" :x="2" :y="6" :size="16" />
            <text x="26" y="18.5" font-size="12" font-weight="700" fill="white">
              GitHub Actions で自動実行
            </text>
          </g>
        </g>

        <!-- 線路 -->
        <g fill="none" stroke-linecap="round">
          <template v-for="(d, i) in segments" :key="i">
            <path
              :ref="(el) => setSeg(i, el)"
              :d="d"
              stroke="var(--color-stage-line)"
              stroke-width="2"
            />
            <path
              :d="d"
              class="wire-flow"
              :stroke="i < litSegments ? 'var(--color-signal)' : 'oklch(1 0 0 / 0.2)'"
              :stroke-width="i < litSegments ? 2.5 : 2"
              :style="{ animationDuration: i < litSegments ? '0.7s' : '2.4s' }"
            />
          </template>
        </g>

        <!-- 開発者 -->
        <g :transform="`translate(${xs.dev} ${Y})`">
          <g class="float-y">
            <circle r="34" fill="url(#ps-node)" stroke="oklch(1 0 0 / 0.14)" stroke-width="2" />
            <AppIcon
              name="laptop"
              :x="-16"
              :y="-16"
              :size="32"
              :stroke="1.5"
              class="text-white/75"
            />
            <text y="60" text-anchor="middle" font-size="13" font-weight="700" fill="white">
              あなた
            </text>
            <text y="77" text-anchor="middle" font-size="11" fill="oklch(1 0 0 / 0.5)">
              git push
            </text>
          </g>
        </g>

        <!-- ステージ -->
        <g v-for="id in stageOrder" :key="id" :transform="`translate(${xs[id]} ${Y})`">
          <g
            :key="`${id}-${stages[id]}`"
            :class="stages[id] === 'failure' ? 'shake' : ''"
            :opacity="stages[id] === 'skipped' || (id === 'build' && !withCheck) ? 0.4 : 1"
            style="transition: opacity 0.4s"
          >
            <circle
              v-if="stages[id] === 'success' || stages[id] === 'failure'"
              r="34"
              :fill="ringColor[stages[id]]"
              style="animation-iteration-count: 1; animation-fill-mode: both"
            />
            <circle
              v-if="stages[id] === 'running'"
              r="42"
              fill="none"
              stroke="var(--color-signal)"
              stroke-width="3"
              stroke-dasharray="36 100"
              stroke-linecap="round"
              class="spin-fast"
            />
            <circle
              r="34"
              fill="url(#ps-node)"
              :stroke="ringColor[stages[id]]"
              stroke-width="2.5"
              :stroke-dasharray="
                stages[id] === 'skipped' || (id === 'build' && !withCheck) ? '5 5' : undefined
              "
              style="transition: stroke 0.3s"
            />
            <AppIcon
              :name="stageIcon[id]"
              :x="-15"
              :y="-15"
              :size="30"
              :stroke="1.6"
              :style="{
                color: stages[id] === 'running' ? 'var(--color-signal)' : 'oklch(1 0 0 / 0.8)',
                transition: 'color .3s',
              }"
            />
            <!-- 使うサービスのロゴ -->
            <g v-if="id !== 'build' || withCheck" transform="translate(26 25)">
              <circle r="12" fill="white" stroke="var(--color-stage)" stroke-width="3" />
              <BrandIcon :name="stageBrand[id]" :x="-7" :y="-7" :size="14" />
            </g>
            <!-- 結果バッジ -->
            <g
              v-if="stages[id] === 'success' || stages[id] === 'failure'"
              transform="translate(25 -25)"
            >
              <circle r="12" :fill="ringColor[stages[id]]" />
              <path
                v-if="stages[id] === 'success'"
                d="M-5 0.5l3.2 3.2L5 -3.5"
                fill="none"
                stroke="var(--color-stage)"
                stroke-width="2.6"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="draw-in"
                style="--len: 18"
              />
              <path
                v-else
                d="M-4 -4l8 8M4 -4l-8 8"
                fill="none"
                stroke="var(--color-stage)"
                stroke-width="2.6"
                stroke-linecap="round"
                class="draw-in"
                style="--len: 24"
              />
            </g>
            <text y="60" text-anchor="middle" font-size="13" font-weight="700" fill="white">
              {{ stageLabel[id] }}
            </text>
            <text
              y="77"
              text-anchor="middle"
              font-size="11"
              font-family="var(--font-mono)"
              fill="oklch(1 0 0 / 0.5)"
            >
              {{ id === "build" && !withCheck ? "チェックなし" : stageSub[id] }}
            </text>
          </g>
        </g>

        <!-- 本番環境 -->
        <g :transform="`translate(${xs.prod} ${Y})`">
          <g :key="`prod-${deployFlash}`" :class="production.healthy ? '' : 'shake'">
            <circle
              v-if="deployFlash > 0"
              r="60"
              :fill="production.healthy ? 'var(--color-ok)' : 'var(--color-ng)'"
              style="animation-iteration-count: 1; animation-fill-mode: both"
            />
            <rect
              x="-58"
              y="-58"
              width="116"
              height="116"
              rx="26"
              :fill="
                production.healthy ? 'oklch(0.78 0.15 160 / 0.12)' : 'oklch(0.68 0.2 20 / 0.2)'
              "
              :stroke="production.healthy ? 'var(--color-ok)' : 'var(--color-ng)'"
              stroke-width="2"
              style="transition: all 0.4s"
            />
            <circle
              r="48"
              :fill="production.healthy ? 'var(--color-ok)' : 'var(--color-ng)'"
              opacity="0.18"
              filter="url(#ps-glow)"
            />
            <AppIcon name="server" :x="-22" :y="-30" :size="44" :stroke="1.4" class="text-white" />
            <!-- ステータスランプ -->
            <circle
              cx="-12.5"
              cy="-17"
              r="2.6"
              :fill="production.healthy ? 'var(--color-ok)' : 'var(--color-ng)'"
            >
              <animate
                attributeName="opacity"
                values="1;0.2;1"
                :dur="production.healthy ? '1.6s' : '0.4s'"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx="-12.5"
              cy="3"
              r="2.6"
              :fill="production.healthy ? 'var(--color-ok)' : 'var(--color-ng)'"
            >
              <animate
                attributeName="opacity"
                values="0.2;1;0.2"
                :dur="production.healthy ? '1.6s' : '0.4s'"
                repeatCount="indefinite"
              />
            </circle>
            <!-- 障害中の炎 -->
            <g v-if="!production.healthy">
              <g v-for="(f, i) in [-30, 4, 30]" :key="i" :transform="`translate(${f - 10} -86)`">
                <AppIcon name="flame" :size="20 + (i % 2) * 6" :stroke="1.6" class="text-ng" />
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  :values="`${f - 10} -80; ${f - 10} -90; ${f - 10} -80`"
                  :dur="`${0.6 + i * 0.15}s`"
                  repeatCount="indefinite"
                />
              </g>
            </g>
            <text
              :key="production.version"
              y="36"
              text-anchor="middle"
              font-size="15"
              font-weight="700"
              font-family="var(--font-display)"
              fill="white"
              class="rise-in"
            >
              v{{ production.version }}
            </text>
            <g transform="translate(44 44)">
              <circle r="14" fill="white" stroke="var(--color-stage)" stroke-width="3" />
              <BrandIcon name="cloudflare" :x="-9" :y="-9" :size="18" />
            </g>
            <text y="84" text-anchor="middle" font-size="13" font-weight="700" fill="white">
              本番環境
            </text>
            <text
              y="101"
              text-anchor="middle"
              font-size="11"
              :fill="production.healthy ? 'var(--color-ok)' : 'var(--color-ng)'"
            >
              {{ production.healthy ? "正常に動作中" : "不具合発生中" }}
            </text>
          </g>
        </g>

        <!-- コミット（パケット） -->
        <g v-if="packet.visible" :opacity="packet.opacity">
          <circle
            v-for="(t, i) in packet.trail"
            :key="i"
            :cx="t.x"
            :cy="t.y"
            :r="6.5 - i * 0.45"
            fill="var(--color-signal)"
            :opacity="0.5 - i * 0.04"
          />
          <g :transform="`translate(${packet.at.x} ${packet.at.y})`">
            <circle r="18" fill="var(--color-signal)" opacity="0.45" filter="url(#ps-glow)" />
            <circle r="8" fill="var(--color-signal)" />
            <circle r="3" fill="white" />
            <g v-if="packet.buggy" transform="translate(0 -24)">
              <circle r="9" fill="var(--color-ng)" />
              <text y="4" text-anchor="middle" font-size="12" font-weight="700" fill="white">
                !
              </text>
            </g>
          </g>
        </g>
      </svg>

      <Transition name="swap" mode="out-in">
        <div
          v-if="message"
          :key="message"
          class="flex items-start gap-3 border-t border-white/10 px-8 py-5 text-[15px] leading-relaxed"
          :class="production.healthy ? 'text-ok' : 'text-ng'"
          role="status"
        >
          <AppIcon :name="production.healthy ? 'checkCircle' : 'alert'" :size="22" class="mt-0.5" />
          <span class="text-white/90">{{ message }}</span>
        </div>
        <div v-else class="border-t border-white/10 px-8 py-5 text-[15px] text-white/45">
          {{ running ? "パイプラインを実行中…" : "下の変更を選んで push してみましょう" }}
        </div>
      </Transition>
    </div>

    <!-- コミット選択 -->
    <div class="mt-10 text-sm font-bold tracking-wide text-ink/50">変更を選んで push する</div>
    <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <button
        v-for="c in commits"
        :key="c.id"
        type="button"
        class="group flex flex-col gap-4 rounded-2xl border border-line bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-lg hover:shadow-ink/5 disabled:pointer-events-none disabled:opacity-45"
        :disabled="running"
        @click="push(c)"
      >
        <span class="flex items-center justify-between">
          <span
            class="flex size-9 items-center justify-center rounded-xl"
            :class="breakageTag[c.breakage]?.cls ?? 'bg-brand-50 text-brand-600'"
          >
            <AppIcon :name="c.icon" :size="18" :stroke="2" />
          </span>
          <span
            v-if="breakageTag[c.breakage]"
            class="rounded-full px-2.5 py-0.5 text-xs font-bold"
            :class="breakageTag[c.breakage]!.cls"
            >{{ breakageTag[c.breakage]!.text }}</span
          >
        </span>
        <span>
          <span class="block text-[15px] leading-relaxed font-bold">{{ c.label }}</span>
          <span class="mt-1 block text-[13px] text-ink/50">{{ c.detail }}</span>
        </span>
        <span
          class="flex items-center gap-1.5 font-mono text-xs text-ink/40 transition group-hover:text-brand-600"
        >
          git push <AppIcon name="arrowRight" :size="13" :stroke="2" />
        </span>
      </button>
    </div>

    <!-- 履歴 -->
    <div v-if="history.length" class="mt-10">
      <div class="text-sm font-bold tracking-wide text-ink/50">実行履歴</div>
      <TransitionGroup tag="ul" name="swap" class="mt-4 space-y-2">
        <li
          v-for="h in history"
          :key="h.id"
          class="grid grid-cols-[5rem_1fr_auto_auto] items-center gap-4 rounded-xl bg-white px-5 py-3.5 text-sm shadow-[0_0_0_1px_var(--color-line)]"
        >
          <span class="text-xs font-bold text-ink/45">{{ h.withCheck ? "CI/CD" : "CD のみ" }}</span>
          <span class="truncate">{{ h.commit }}</span>
          <span class="text-xs" :class="h.deployed ? 'text-brand-600' : 'text-ink/45'">{{
            h.deployed ? "デプロイした" : "デプロイを止めた"
          }}</span>
          <span
            class="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold"
            :class="h.healthy ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'"
          >
            <AppIcon :name="h.healthy ? 'check' : 'flame'" :size="13" :stroke="2.2" />
            {{ h.healthy ? "本番 正常" : "本番 障害" }}
          </span>
        </li>
      </TransitionGroup>
    </div>
  </div>
</template>
