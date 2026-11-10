<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { handleRequest } from "../../lib/honoRouter";
import { isAbort, sleep, travelAlong, tween, type Point } from "../../lib/motion";
import AppIcon from "../icons/AppIcon.vue";
import BrandIcon from "../icons/BrandIcon.vue";
import type { BrandName } from "../icons/brands";
import type { IconName } from "../icons/icons";

const host = "my-api.your-name.workers.dev";
const path = ref("/hello/taro");
const step = ref(0);
const playing = ref(false);

const normalizedPath = computed(() => (path.value.startsWith("/") ? path.value : `/${path.value}`));
const response = computed(() => handleRequest("GET", normalizedPath.value));
const ok = computed(() => response.value.status === 200);

type NodeId = "browser" | "dns" | "edge" | "worker";
const nodes: {
  id: NodeId;
  label: string;
  sub: string;
  icon: IconName;
  x: number;
  y: number;
  brand?: BrandName;
}[] = [
  {
    id: "browser",
    label: "ブラウザ",
    sub: "あなたのPC",
    icon: "laptop",
    x: 110,
    y: 205,
    brand: "googlechrome",
  },
  { id: "dns", label: "DNS", sub: "名前 → IP", icon: "book", x: 340, y: 78 },
  {
    id: "edge",
    label: "Cloudflare",
    sub: "近くの拠点",
    icon: "globe",
    x: 590,
    y: 205,
    brand: "cloudflare",
  },
  {
    id: "worker",
    label: "Worker",
    sub: "Hono が動く",
    icon: "bolt",
    x: 800,
    y: 205,
    brand: "hono",
  },
];

/** 各ステップで光らせるノードと経路 */
const steps: { title: string; short: string; focus: NodeId[]; wire: string | null }[] = [
  { title: "URL を入力", short: "URL", focus: ["browser"], wire: null },
  { title: "DNS で住所を調べる", short: "DNS", focus: ["dns"], wire: "dns" },
  { title: "HTTPS でリクエスト送信", short: "HTTPS", focus: ["edge"], wire: "req" },
  { title: "Hono がルートを処理", short: "Hono", focus: ["worker"], wire: "worker" },
  { title: "JSON が返ってくる", short: "Response", focus: ["browser"], wire: "resp" },
];

const wires = {
  dns: "M146 180 C 196 110, 240 78, 296 78",
  req: "M154 205 C 300 205, 420 205, 546 205",
  worker: "M634 205 L 756 205",
  resp: "M800 252 C 690 330, 230 330, 110 252",
} as const;
type WireId = keyof typeof wires;

const wireEls: Partial<Record<WireId, SVGPathElement>> = {};
function setWire(id: WireId, el: unknown) {
  if (el instanceof SVGPathElement) wireEls[id] = el;
}

// --- パケットの状態 ---
const packet = ref<{
  visible: boolean;
  at: Point;
  trail: Point[];
  label: string;
  tone: "signal" | "ok" | "ng";
  lock: boolean;
}>({ visible: false, at: { x: 0, y: 0 }, trail: [], label: "", tone: "signal", lock: false });

const typed = ref(0); // URL バブルに表示する文字数
const dnsAnswer = ref(false);
const handshake = ref(0); // TLS ハンドシェイクの波紋（増えるたびに再生）
const workerBusy = ref(false);
const delivered = ref(false); // ブラウザにレスポンスが届いた
const urlText = computed(() => `GET ${normalizedPath.value}`);

let ac: AbortController | null = null;
onBeforeUnmount(() => ac?.abort());

function resetScene() {
  packet.value = { ...packet.value, visible: false, trail: [], lock: false };
  dnsAnswer.value = false;
  workerBusy.value = false;
  delivered.value = false;
}

async function travel(id: WireId, ms: number, signal: AbortSignal, reverse = false) {
  const el = wireEls[id];
  if (!el) return;
  packet.value.visible = true;
  await travelAlong(
    el,
    ms,
    (p, trail) => {
      packet.value.at = p;
      packet.value.trail = trail;
    },
    { signal, reverse, trailLength: 14 },
  );
  packet.value.trail = [];
}

/** ステップ n の演出を最初から再生する */
async function animate(n: number, signal: AbortSignal) {
  resetScene();
  if (n === 0) {
    typed.value = 0;
    await tween(900, (t) => (typed.value = Math.round(urlText.value.length * t)), {
      signal,
      ease: (t) => t,
    });
    return;
  }
  typed.value = urlText.value.length;
  if (n === 1) {
    Object.assign(packet.value, { label: "どこ？", tone: "signal" });
    await travel("dns", 900, signal);
    await sleep(450, signal);
    dnsAnswer.value = true;
    packet.value.label = "104.21.x.x";
    await sleep(350, signal);
    await travel("dns", 900, signal, true);
    packet.value.visible = false;
  } else if (n === 2) {
    dnsAnswer.value = true;
    Object.assign(packet.value, {
      label: urlText.value,
      tone: "signal",
      lock: true,
      at: { x: 154, y: 205 },
      visible: true,
    });
    for (let i = 0; i < 2; i++) {
      handshake.value++;
      await sleep(420, signal);
    }
    await travel("req", 1300, signal);
  } else if (n === 3) {
    Object.assign(packet.value, { label: urlText.value, tone: "signal", lock: true });
    await travel("worker", 700, signal);
    workerBusy.value = true;
    await sleep(1100, signal);
    workerBusy.value = false;
  } else {
    Object.assign(packet.value, {
      label: `${response.value.status} ${ok.value ? "OK" : "Not Found"}`,
      tone: ok.value ? "ok" : "ng",
      lock: true,
    });
    await travel("resp", 1600, signal);
    packet.value.visible = false;
    delivered.value = true;
  }
}

function run(n: number) {
  ac?.abort();
  ac = new AbortController();
  animate(n, ac.signal).catch((e) => {
    if (!isAbort(e)) throw e;
  });
}

function go(n: number) {
  playing.value = false;
  step.value = n;
  run(n);
}

async function playAll() {
  ac?.abort();
  const own = new AbortController();
  ac = own;
  playing.value = true;
  try {
    for (let n = 0; n < steps.length; n++) {
      step.value = n;
      await animate(n, own.signal);
      await sleep(1400, own.signal);
    }
  } catch (e) {
    if (!isAbort(e)) throw e;
  } finally {
    if (ac === own) playing.value = false;
  }
}

function stop() {
  ac?.abort();
  playing.value = false;
}

function onPathInput() {
  go(0);
}

onMounted(() => run(0));

const isLast = computed(() => step.value === steps.length - 1);
const toneColor = { signal: "var(--color-signal)", ok: "var(--color-ok)", ng: "var(--color-ng)" };
const labelWidth = (s: string) => s.length * 7.4 + 22;
</script>

<template>
  <div class="not-prose my-14 xl:-mx-20">
    <!-- アドレスバー -->
    <div
      class="flex items-center gap-3 rounded-2xl border border-line bg-white px-5 py-3.5 shadow-[0_1px_0_var(--color-line)] focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-100"
    >
      <AppIcon name="lock" :size="18" class="text-emerald-600" />
      <span class="font-mono text-[15px] text-ink/45">https://{{ host }}</span>
      <input
        id="rj-path"
        v-model="path"
        aria-label="アクセスするURLのパス"
        class="min-w-0 flex-1 bg-transparent font-mono text-[15px] text-ink outline-none"
        spellcheck="false"
        @input="onPathInput"
      />
    </div>
    <p class="mt-3 pl-1 text-sm leading-relaxed text-ink/55">
      パスを <code class="font-mono text-ink/80">/</code>・<code class="font-mono text-ink/80"
        >/health</code
      >・<code class="font-mono text-ink/80">/users</code> などに書き換えると、結果が変わります
    </p>

    <!-- ステージ -->
    <div class="stage mt-6">
      <svg viewBox="0 0 900 360" class="block w-full" role="img" aria-label="リクエストの経路図">
        <defs>
          <filter id="rj-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <radialGradient id="rj-node" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stop-color="oklch(0.34 0.05 265)" />
            <stop offset="100%" stop-color="oklch(0.24 0.035 265)" />
          </radialGradient>
        </defs>

        <!-- 経路 -->
        <g fill="none" stroke-linecap="round">
          <template v-for="(d, id) in wires" :key="id">
            <path
              :ref="(el) => setWire(id, el)"
              :d="d"
              stroke="var(--color-stage-line)"
              stroke-width="2"
            />
            <path
              :d="d"
              class="wire-flow"
              :stroke="
                steps[step]!.wire === id
                  ? id === 'resp'
                    ? toneColor[ok ? 'ok' : 'ng']
                    : 'var(--color-signal)'
                  : 'oklch(1 0 0 / 0.22)'
              "
              :stroke-width="steps[step]!.wire === id ? 2.5 : 2"
              :style="{ animationDuration: steps[step]!.wire === id ? '0.6s' : '2.4s' }"
            />
          </template>
        </g>

        <!-- 経路ラベル -->
        <g font-size="11" fill="oklch(1 0 0 / 0.45)" font-family="var(--font-mono)">
          <text x="350" y="194" text-anchor="middle">HTTPS</text>
          <text x="455" y="345" text-anchor="middle">response</text>
        </g>

        <!-- ノード -->
        <g v-for="n in nodes" :key="n.id" :transform="`translate(${n.x} ${n.y})`">
          <g class="float-y" :style="{ animationDelay: `${n.x * -3}ms` }">
            <template v-if="steps[step]!.focus.includes(n.id)">
              <circle r="44" fill="var(--color-signal)" opacity="0.25" class="pulse-ring" />
              <circle r="52" fill="var(--color-signal)" opacity="0.18" filter="url(#rj-glow)" />
            </template>
            <!-- エッジの周回軌道 -->
            <g v-if="n.id === 'edge'" class="spin-slow">
              <ellipse
                rx="64"
                ry="22"
                fill="none"
                stroke="oklch(0.78 0.11 230 / 0.45)"
                stroke-dasharray="3 6"
                transform="rotate(-18)"
              />
              <circle cx="61" cy="-20" r="3.5" fill="var(--color-cool)" />
              <circle cx="-58" cy="24" r="2.5" fill="var(--color-cool)" />
            </g>
            <!-- Worker の処理中リング -->
            <circle
              v-if="n.id === 'worker' && workerBusy"
              r="50"
              fill="none"
              stroke="var(--color-signal)"
              stroke-width="3"
              stroke-dasharray="40 120"
              stroke-linecap="round"
              class="spin-fast"
            />
            <circle
              r="40"
              fill="url(#rj-node)"
              :stroke="
                steps[step]!.focus.includes(n.id) ? 'var(--color-signal)' : 'oklch(1 0 0 / 0.14)'
              "
              stroke-width="2"
              style="transition: stroke 0.3s"
            />
            <AppIcon
              :name="n.icon"
              :x="-19"
              :y="-19"
              :size="38"
              :stroke="1.5"
              :style="{
                color:
                  n.id === 'worker' && workerBusy
                    ? 'var(--color-signal)'
                    : steps[step]!.focus.includes(n.id)
                      ? 'white'
                      : 'oklch(1 0 0 / 0.7)',
              }"
            />
            <!-- サービスのロゴバッジ -->
            <g v-if="n.brand" transform="translate(29 29)">
              <circle r="14" fill="white" stroke="var(--color-stage)" stroke-width="3" />
              <BrandIcon :name="n.brand" :x="-8" :y="-8" :size="16" />
            </g>
            <text y="66" text-anchor="middle" font-size="14" font-weight="700" fill="white">
              {{ n.label }}
            </text>
            <text y="84" text-anchor="middle" font-size="11" fill="oklch(1 0 0 / 0.5)">
              {{ n.sub }}
            </text>
          </g>
        </g>

        <!-- URL 入力バブル -->
        <g :transform="`translate(110 118)`">
          <g v-if="(typed > 0 || step === 0) && !delivered" class="rise-in">
            <rect
              :x="-labelWidth(urlText) / 2"
              y="-17"
              :width="labelWidth(urlText)"
              height="30"
              rx="15"
              fill="white"
            />
            <path d="M-6 13 L0 21 L6 13Z" fill="white" />
            <text
              y="3"
              text-anchor="middle"
              font-size="12.5"
              font-family="var(--font-mono)"
              fill="var(--color-ink)"
            >
              {{ urlText.slice(0, typed) }}
              <tspan v-if="typed < urlText.length" fill="var(--color-brand-500)">▍</tspan>
            </text>
          </g>
        </g>

        <!-- DNS の回答 -->
        <g v-if="dnsAnswer" transform="translate(410 66)">
          <g class="rise-in">
            <rect
              x="0"
              y="-16"
              width="158"
              height="30"
              rx="8"
              fill="oklch(1 0 0 / 0.08)"
              stroke="oklch(1 0 0 / 0.2)"
            />
            <text
              x="12"
              y="4"
              font-size="11.5"
              font-family="var(--font-mono)"
              fill="var(--color-cool)"
            >
              A 104.21.x.x
            </text>
          </g>
        </g>

        <!-- TLS ハンドシェイクの波紋 -->
        <g v-if="step === 2" transform="translate(110 205)">
          <circle
            v-for="h in handshake"
            :key="h"
            r="48"
            fill="none"
            stroke="var(--color-ok)"
            stroke-width="2"
            style="animation-iteration-count: 1; animation-fill-mode: both"
          />
        </g>

        <!-- 届いたレスポンス -->
        <g v-if="delivered" transform="translate(110 118)">
          <g class="rise-in">
            <rect
              x="-58"
              y="-17"
              width="116"
              height="30"
              rx="15"
              :fill="ok ? 'var(--color-ok)' : 'var(--color-ng)'"
            />
            <text
              y="3"
              text-anchor="middle"
              font-size="12.5"
              font-weight="700"
              font-family="var(--font-mono)"
              fill="var(--color-stage)"
            >
              {{ response.status }} {{ ok ? "OK" : "Not Found" }}
            </text>
          </g>
        </g>

        <!-- パケット -->
        <g v-if="packet.visible">
          <circle
            v-for="(t, i) in packet.trail"
            :key="i"
            :cx="t.x"
            :cy="t.y"
            :r="7 - i * 0.4"
            :fill="toneColor[packet.tone]"
            :opacity="0.5 - i * 0.035"
          />
          <g :transform="`translate(${packet.at.x} ${packet.at.y})`">
            <circle r="18" :fill="toneColor[packet.tone]" opacity="0.45" filter="url(#rj-glow)" />
            <circle r="8" :fill="toneColor[packet.tone]" />
            <circle r="3.2" fill="white" />
            <g transform="translate(0 -30)">
              <rect
                :x="-labelWidth(packet.label) / 2 - (packet.lock ? 9 : 0)"
                y="-12"
                :width="labelWidth(packet.label) + (packet.lock ? 18 : 0)"
                height="24"
                rx="12"
                fill="var(--color-stage)"
                :stroke="toneColor[packet.tone]"
                stroke-width="1.5"
              />
              <AppIcon
                v-if="packet.lock"
                name="lock"
                :x="-labelWidth(packet.label) / 2 - 1"
                :y="-7"
                :size="14"
                :stroke="2"
                :style="{ color: toneColor[packet.tone] }"
              />
              <text
                :x="packet.lock ? 9 : 0"
                y="4"
                text-anchor="middle"
                font-size="11.5"
                font-family="var(--font-mono)"
                fill="white"
              >
                {{ packet.label }}
              </text>
            </g>
          </g>
        </g>
      </svg>

      <!-- タイムライン -->
      <div class="border-t border-white/10 px-8 pt-6 pb-7">
        <div class="relative flex justify-between">
          <div class="absolute top-[13px] right-[10%] left-[10%] h-0.5 bg-white/10" />
          <div
            class="absolute top-[13px] left-[10%] h-0.5 bg-signal transition-all duration-500"
            :style="{ width: `${(step / (steps.length - 1)) * 80}%` }"
          />
          <button
            v-for="(s, i) in steps"
            :key="s.title"
            type="button"
            class="group relative z-10 flex w-1/5 flex-col items-center gap-2.5"
            :aria-current="i === step ? 'step' : undefined"
            @click="go(i)"
          >
            <span
              class="flex size-7 items-center justify-center rounded-full font-display text-xs font-bold transition-all duration-300"
              :class="
                i === step
                  ? 'scale-110 bg-signal text-stage shadow-[0_0_0_6px_var(--color-signal-soft)]'
                  : i < step
                    ? 'bg-signal/80 text-stage'
                    : 'bg-white/10 text-white/60 group-hover:bg-white/20'
              "
              >{{ i + 1 }}</span
            >
            <span
              class="text-center text-xs leading-snug transition-colors"
              :class="i === step ? 'font-bold text-white' : 'text-white/50'"
              >{{ s.title }}</span
            >
          </button>
        </div>
      </div>
    </div>

    <!-- 解説 -->
    <div class="mt-8 grid gap-8 md:grid-cols-[1fr_auto] md:items-start">
      <Transition name="swap" mode="out-in">
        <div :key="step" class="min-h-48 text-[16px] leading-[2] text-ink/85">
          <template v-if="step === 0">
            <p>ブラウザに URL を入力しました。URL は「どこの・何を」を表す住所です。</p>
            <dl class="mt-5 grid grid-cols-[6rem_1fr] gap-x-4 gap-y-3 font-mono text-[14px]">
              <dt class="text-ink/45">スキーム</dt>
              <dd>https <span class="font-sans text-ink/55">— 暗号化して通信する</span></dd>
              <dt class="text-ink/45">ホスト名</dt>
              <dd>{{ host }} <span class="font-sans text-ink/55">— どのサーバーか</span></dd>
              <dt class="text-ink/45">パス</dt>
              <dd>
                {{ normalizedPath }} <span class="font-sans text-ink/55">— 何がほしいか</span>
              </dd>
            </dl>
          </template>
          <template v-else-if="step === 1">
            <p>
              コンピューター同士は名前ではなく <strong>IP アドレス</strong> で相手を探します。
              そこで
              <strong>DNS</strong>（電話帳のような仕組み）に「この名前はどこ？」と問い合わせます。
            </p>
            <p class="mt-4 text-ink/65">
              workers.dev は Cloudflare が管理しているドメインなので、Cloudflare の IP
              が返ってきます。
            </p>
          </template>
          <template v-else-if="step === 2">
            <p>
              教えてもらった IP に接続し、<strong>TLS</strong> で通信を暗号化してから（これが HTTPS
              の S）、HTTP リクエストを送ります。
            </p>
            <pre
              class="mt-5 rounded-xl bg-stage px-5 py-4 font-mono text-[13px] leading-relaxed text-white/90"
            >
GET {{ normalizedPath }} HTTP/2
Host: {{ host }}
Accept: application/json</pre>
            <p class="mt-4 text-ink/65">
              リクエストは世界中にある Cloudflare
              の拠点（エッジ）のうち、<strong>あなたに近い場所</strong>に届きます。
            </p>
          </template>
          <template v-else-if="step === 3">
            <p>エッジで <strong>Worker</strong> が起動し、Hono がパスに合うルートを探します。</p>
            <pre
              class="mt-5 rounded-xl bg-stage px-5 py-4 font-mono text-[13px] leading-[1.9]"
            ><span :class="response.matched === '/' ? 'text-signal' : 'text-white/35'">app.get("/", ...)</span>
<span :class="response.matched === '/hello/:name' ? 'text-signal' : 'text-white/35'">app.get("/hello/:name", ...)</span>
<span :class="response.matched === '/health' ? 'text-signal' : 'text-white/35'">app.get("/health", ...)</span></pre>
            <p class="mt-4">
              <template v-if="response.matched">
                <code>{{ response.matched }}</code> がマッチしました（光っている行）。
              </template>
              <template v-else>
                どのルートにもマッチしません。Hono は自動で
                <strong>404 Not Found</strong> を返します。
              </template>
            </p>
          </template>
          <template v-else>
            <p>処理結果が JSON としてブラウザに返ってきました。</p>
            <pre
              class="mt-5 rounded-xl bg-stage px-5 py-4 font-mono text-[13px] leading-relaxed text-white/90"
            >
HTTP/2 <span :class="ok ? 'text-ok' : 'text-ng'">{{ response.status }}</span>
content-type: application/json

{{ JSON.stringify(response.body, null, 2) }}</pre>
            <p class="mt-4 text-ink/65">
              ここまでが数十ミリ秒の出来事です。localhost では、この経路のすべてが自分の PC
              の中で完結していました。
            </p>
          </template>
        </div>
      </Transition>

      <div class="flex gap-3 md:flex-col">
        <button
          v-if="!playing"
          type="button"
          class="flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
          @click="isLast ? go(0) : go(step + 1)"
        >
          <template v-if="isLast"
            ><AppIcon name="replay" :size="16" :stroke="2" />最初から</template
          >
          <template v-else>次へ<AppIcon name="arrowRight" :size="16" :stroke="2" /></template>
        </button>
        <button
          type="button"
          class="flex items-center justify-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-bold text-ink/80 transition hover:border-ink/30"
          @click="playing ? stop() : playAll()"
        >
          <AppIcon :name="playing ? 'minus' : 'play'" :size="16" :stroke="2" />
          {{ playing ? "停止" : "自動再生" }}
        </button>
        <button
          v-if="step > 0 && !playing"
          type="button"
          class="flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm text-ink/55 transition hover:text-ink"
          @click="go(step - 1)"
        >
          <AppIcon name="arrowLeft" :size="16" :stroke="2" />戻る
        </button>
      </div>
    </div>
  </div>
</template>
