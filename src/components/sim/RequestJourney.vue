<script setup lang="ts">
import { computed, ref } from "vue";
import { handleRequest } from "../../lib/honoRouter";

const host = "my-api.your-name.workers.dev";
const path = ref("/hello/taro");
const step = ref(0);

const normalizedPath = computed(() => (path.value.startsWith("/") ? path.value : `/${path.value}`));
const response = computed(() => handleRequest("GET", normalizedPath.value));

const nodes = [
  { id: "browser", label: "ブラウザ", icon: "💻" },
  { id: "dns", label: "DNS", icon: "📖" },
  { id: "edge", label: "Cloudflare", icon: "🌐" },
  { id: "worker", label: "Worker (Hono)", icon: "🔥" },
] as const;

interface Step {
  title: string;
  /** パケットがいるノードのインデックス */
  at: number;
  /** 矢印の向き（from → to） */
  from: number;
  to: number;
}

const steps: Step[] = [
  { title: "URL を入力", at: 0, from: 0, to: 0 },
  { title: "DNS で住所を調べる", at: 1, from: 0, to: 1 },
  { title: "HTTPS で接続してリクエスト送信", at: 2, from: 0, to: 2 },
  { title: "Hono がルートを処理", at: 3, from: 2, to: 3 },
  { title: "JSON レスポンスが返る", at: 0, from: 3, to: 0 },
];

const current = computed(() => steps[step.value]!);
const packetLeft = computed(() => `${(current.value.at / (nodes.length - 1)) * 100}%`);
const isLast = computed(() => step.value === steps.length - 1);

function next() {
  if (!isLast.value) step.value++;
}
function prev() {
  if (step.value > 0) step.value--;
}
function restart() {
  step.value = 0;
}
</script>

<template>
  <div class="not-prose my-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <label class="block text-xs font-bold text-slate-500" for="rj-path">アクセスするURL</label>
    <div
      class="mt-1 flex items-center overflow-hidden rounded-lg border border-slate-300 font-mono text-sm focus-within:ring-2 focus-within:ring-brand-100"
    >
      <span class="bg-slate-100 px-3 py-2 text-slate-500">https://{{ host }}</span>
      <input
        id="rj-path"
        v-model="path"
        class="flex-1 px-2 py-2 outline-none"
        spellcheck="false"
        @input="restart"
      />
    </div>
    <p class="mt-1 text-xs text-slate-500">
      パスを <code>/</code>、<code>/health</code>、<code>/users</code> などに変えて試してみよう
    </p>

    <!-- ノードとパケット -->
    <div class="relative mx-12 mt-10 mb-4 h-24">
      <div class="absolute top-8 right-0 left-0 h-0.5 bg-slate-200" />
      <div
        v-for="(n, i) in nodes"
        :key="n.id"
        class="absolute top-0 flex w-24 -translate-x-1/2 flex-col items-center"
        :style="{ left: `${(i / (nodes.length - 1)) * 100}%` }"
      >
        <div
          class="flex size-16 items-center justify-center rounded-2xl border-2 bg-white text-2xl transition"
          :class="
            current.at === i ? 'border-brand-500 shadow-lg shadow-brand-100' : 'border-slate-200'
          "
        >
          {{ n.icon }}
        </div>
        <div class="mt-1.5 text-xs font-semibold text-slate-700">{{ n.label }}</div>
      </div>
      <div
        class="absolute top-6 z-10 flex h-5 -translate-x-1/2 items-center rounded-full px-2 text-[10px] font-bold text-white shadow transition-all duration-700 ease-in-out"
        :class="step === steps.length - 1 ? 'bg-emerald-500' : 'bg-brand-600'"
        :style="{ left: packetLeft, marginTop: '-40px' }"
      >
        {{ step === steps.length - 1 ? "Response" : "Request" }}
      </div>
    </div>

    <!-- ステップ表示 -->
    <ol class="mt-6 flex gap-1">
      <li
        v-for="(s, i) in steps"
        :key="s.title"
        class="flex-1 rounded-md px-2 py-1.5 text-center text-[11px]"
        :class="
          i === step
            ? 'bg-brand-600 font-bold text-white'
            : i < step
              ? 'bg-brand-100 text-brand-700'
              : 'bg-slate-100 text-slate-500'
        "
      >
        {{ i + 1 }}. {{ s.title }}
      </li>
    </ol>

    <div class="mt-4 min-h-44 rounded-lg bg-slate-50 p-5 text-sm leading-relaxed">
      <template v-if="step === 0">
        <p>
          ブラウザに URL を入力しました。URL
          は「どこの・何を」を表す住所です。分解するとこうなります。
        </p>
        <ul class="mt-2 space-y-1 font-mono text-[13px]">
          <li><span class="text-slate-500">スキーム：</span>https（暗号化して通信する）</li>
          <li><span class="text-slate-500">ホスト名：</span>{{ host }}（どのサーバーか）</li>
          <li>
            <span class="text-slate-500">パス　　：</span>{{ normalizedPath }}（何がほしいか）
          </li>
        </ul>
      </template>
      <template v-else-if="step === 1">
        <p>
          コンピューター同士は名前ではなく <strong>IP アドレス</strong> で相手を探します。そこで
          <strong>DNS</strong>（電話帳のような仕組み）に「<code>{{ host }}</code>
          はどこ？」と問い合わせます。
        </p>
        <pre class="mt-3 rounded bg-slate-900 px-4 py-2 font-mono text-xs text-slate-100"
          >{{ host }}  →  104.21.xx.xx（Cloudflare のサーバー）</pre>
        <p class="mt-2 text-slate-600">
          workers.dev のドメインは Cloudflare が管理しているので、Cloudflare の IP が返ってきます。
        </p>
      </template>
      <template v-else-if="step === 2">
        <p>
          教えてもらった IP に接続し、<strong>TLS</strong>
          で通信を暗号化してから（これが HTTPS の S）、HTTP リクエストを送ります。
        </p>
        <pre class="mt-3 rounded bg-slate-900 px-4 py-2 font-mono text-xs text-slate-100">
GET {{ normalizedPath }} HTTP/2
Host: {{ host }}
Accept: application/json</pre>
        <p class="mt-2 text-slate-600">
          リクエストは世界中にある Cloudflare の拠点（エッジ）のうち、<strong
            >あなたに近い場所</strong
          >
          に届きます。
        </p>
      </template>
      <template v-else-if="step === 3">
        <p>エッジで <strong>Worker</strong> が起動し、Hono がパスに合うルートを探します。</p>
        <pre
          class="mt-3 rounded bg-slate-900 px-4 py-2 font-mono text-xs text-slate-100"
        ><span :class="response.matched === '/' ? 'text-amber-300' : 'text-slate-400'">app.get("/", ...)</span>
<span :class="response.matched === '/hello/:name' ? 'text-amber-300' : 'text-slate-400'">app.get("/hello/:name", ...)</span>
<span :class="response.matched === '/health' ? 'text-amber-300' : 'text-slate-400'">app.get("/health", ...)</span></pre>
        <p class="mt-2">
          <template v-if="response.matched">
            <code>{{ response.matched }}</code> がマッチしました（黄色の行）。
          </template>
          <template v-else>
            どのルートにもマッチしません。Hono は自動で <strong>404 Not Found</strong> を返します。
          </template>
        </p>
      </template>
      <template v-else>
        <p>処理結果が JSON としてブラウザに返ってきました。</p>
        <pre class="mt-3 rounded bg-slate-900 px-4 py-2 font-mono text-xs text-slate-100">
HTTP/2 <span :class="response.status === 200 ? 'text-emerald-300' : 'text-rose-300'">{{ response.status }}</span>
content-type: application/json

{{ JSON.stringify(response.body, null, 2) }}</pre>
        <p class="mt-2 text-slate-600">
          ここまでが一瞬（数十ミリ秒）で起きています。localhost
          では、この経路のすべてが自分のPCの中で完結していました。
        </p>
      </template>
    </div>

    <div class="mt-4 flex justify-between">
      <button
        type="button"
        class="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-40"
        :disabled="step === 0"
        @click="prev"
      >
        ← 戻る
      </button>
      <button
        v-if="!isLast"
        type="button"
        class="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        @click="next"
      >
        次へ →
      </button>
      <button
        v-else
        type="button"
        class="rounded-lg border border-brand-500 px-5 py-2 text-sm font-semibold text-brand-700"
        @click="restart"
      >
        別のURLで最初から
      </button>
    </div>
  </div>
</template>
