<script setup lang="ts">
import TermText from "../ui/TermText.vue";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { tween } from "../../lib/motion";
import BrandIcon from "../icons/BrandIcon.vue";
import { brands, type BrandName } from "../icons/brands";

const layers = ["アプリのコード", "データ", "ランタイム", "OS", "サーバー・ネットワーク"] as const;

interface Model {
  id: string;
  name: string;
  full: string;
  /** 利用者が管理する層の数（上から） */
  youManage: number;
  desc: string;
  examples: string;
  brands: BrandName[];
  note?: string;
}

const models: Model[] = [
  {
    id: "onprem",
    name: "オンプレ",
    full: "On-premises",
    youManage: 5,
    desc: "サーバーを自分で買って設置する。全部自分の責任。",
    examples: "社内のサーバールーム、自宅のラズパイ",
    brands: ["raspberrypi"],
  },
  {
    id: "iaas",
    name: "IaaS",
    full: "Infrastructure as a Service",
    youManage: 4,
    desc: "仮想マシンを借りる。OS から上は自分で面倒を見る。",
    examples: "AWS EC2、Google Compute Engine、Azure VM",
    brands: ["aws", "googlecloud", "azure"],
  },
  {
    id: "paas",
    name: "PaaS",
    full: "Platform as a Service",
    youManage: 2,
    desc: "コードを渡せば動かしてくれる。OS や[[runtime|ランタイム]]の更新は事業者まかせ。",
    examples: "Render、Heroku、Google App Engine",
    brands: ["render", "heroku", "googlecloud"],
  },
  {
    id: "faas",
    name: "FaaS",
    full: "Function as a Service",
    youManage: 2,
    desc: "関数単位でリクエストが来たときだけ動く。サーバーの存在を意識しない（[[serverless|サーバーレス]]）。",
    examples: "Cloudflare Workers、AWS Lambda、Vercel Functions",
    brands: ["cloudflareworkers", "aws", "vercel"],
    note: "PaaS との違いは「常駐しない・リクエスト単位で課金・自動スケール」。データは別サービスに置く。",
  },
  {
    id: "baas",
    name: "BaaS",
    full: "Backend as a Service",
    youManage: 1,
    desc: "認証・DB・ストレージなどバックエンドの機能を API で丸ごと使う。",
    examples: "Firebase、Supabase",
    brands: ["firebase", "supabase"],
    note: "サーバー側のコードをほぼ書かずに済む一方、データ設計とアクセスルールは自分の責任。",
  },
  {
    id: "saas",
    name: "SaaS",
    full: "Software as a Service",
    youManage: 0,
    desc: "完成したソフトウェアを使うだけ。",
    examples: "Gmail、Notion、Slack、GitHub",
    brands: ["gmail", "notion", "slack", "github"],
  },
];

const selectedIndex = ref(models.findIndex((m) => m.id === "faas"));
const selected = computed(() => models[selectedIndex.value]!);

// --- アイソメトリックな積み層の形 ---
const CX = 160;
const W = 210;
const D = 84;
const T = 22;
const GAP = 52;
const TOP = 62;
const slabY = (i: number) => TOP + i * GAP;
const top = (y: number) =>
  `M${CX} ${y - D / 2} L${CX + W / 2} ${y} L${CX} ${y + D / 2} L${CX - W / 2} ${y} Z`;
const left = (y: number) =>
  `M${CX - W / 2} ${y} L${CX} ${y + D / 2} L${CX} ${y + D / 2 + T} L${CX - W / 2} ${y + T} Z`;
const right = (y: number) =>
  `M${CX} ${y + D / 2} L${CX + W / 2} ${y} L${CX + W / 2} ${y + T} L${CX} ${y + D / 2 + T} Z`;

const palette = {
  you: { top: "oklch(0.84 0.15 75)", left: "oklch(0.7 0.15 60)", right: "oklch(0.62 0.14 50)" },
  them: {
    top: "oklch(0.42 0.06 250)",
    left: "oklch(0.32 0.05 255)",
    right: "oklch(0.27 0.045 258)",
  },
};

// 管理範囲の括弧はなめらかに伸び縮みさせる
const bracket = ref(selected.value.youManage);
let ac: AbortController | null = null;
watch(
  () => selected.value.youManage,
  (to) => {
    ac?.abort();
    ac = new AbortController();
    const from = bracket.value;
    tween(600, (t) => (bracket.value = from + (to - from) * t), { signal: ac.signal }).catch(
      () => {},
    );
  },
);
onBeforeUnmount(() => ac?.abort());

const bracketTop = TOP - D / 2;
const bracketBottom = computed(() =>
  bracket.value <= 0.01 ? bracketTop : slabY(bracket.value - 1) + D / 2 + T - 8,
);
</script>

<template>
  <div class="not-prose my-14 xl:-mx-20">
    <!-- 切り替え -->
    <div class="relative grid grid-cols-6 rounded-full bg-ink/[0.06] p-1.5">
      <div
        class="absolute top-1.5 bottom-1.5 left-1.5 rounded-full bg-ink shadow-lg transition-transform duration-500 ease-[cubic-bezier(0.3,1.3,0.5,1)]"
        :style="{
          width: 'calc((100% - 0.75rem) / 6)',
          transform: `translateX(${selectedIndex * 100}%)`,
        }"
      />
      <button
        v-for="(m, i) in models"
        :key="m.id"
        type="button"
        class="relative z-10 rounded-full py-2.5 text-sm font-bold transition-colors duration-300"
        :class="selectedIndex === i ? 'text-white' : 'text-ink/55 hover:text-ink'"
        :aria-pressed="selectedIndex === i"
        @click="selectedIndex = i"
      >
        {{ m.name }}
      </button>
    </div>

    <div class="stage mt-6 grid items-center gap-4 p-6 md:grid-cols-[460px_1fr] md:p-8">
      <svg viewBox="0 0 460 370" class="block w-full" role="img" aria-label="管理範囲の積み層">
        <!-- 管理範囲の括弧 -->
        <g stroke-linecap="round" fill="none" stroke-width="2.5">
          <path
            v-if="bracket > 0.01"
            :d="`M30 ${bracketTop} h-10 V${bracketBottom} h10`"
            stroke="var(--color-signal)"
          />
          <path
            v-if="bracket < 4.99"
            :d="`M30 ${bracketBottom + 16} h-10 V${slabY(4) + D / 2 + T} h10`"
            stroke="var(--color-cool)"
            opacity="0.7"
          />
        </g>
        <text
          v-if="bracket > 0.6"
          x="6"
          :y="(bracketTop + bracketBottom) / 2"
          writing-mode="vertical-rl"
          text-anchor="middle"
          font-size="12"
          font-weight="700"
          fill="var(--color-signal)"
        >
          あなた
        </text>
        <text
          v-if="bracket < 4.4"
          x="6"
          :y="(bracketBottom + 16 + slabY(4) + D / 2 + T) / 2"
          writing-mode="vertical-rl"
          text-anchor="middle"
          font-size="12"
          font-weight="700"
          fill="var(--color-cool)"
        >
          事業者
        </text>

        <!-- 下の層から描く（上の層が手前に重なる） -->
        <g v-for="i in [4, 3, 2, 1, 0]" :key="i">
          <g
            :style="{
              transform: `translateY(${i < selected.youManage ? -10 : 0}px)`,
              transition: `transform .55s cubic-bezier(.3,1.4,.5,1) ${i * 70}ms`,
            }"
          >
            <path
              v-for="(face, f) in [left, right, top]"
              :key="f"
              :d="face(slabY(i))"
              :fill="
                (i < selected.youManage ? palette.you : palette.them)[
                  (['left', 'right', 'top'] as const)[f]!
                ]
              "
              :style="{ transition: `fill .45s ease ${i * 70}ms` }"
              stroke="oklch(0 0 0 / 0.15)"
              stroke-linejoin="round"
            />
            <!-- 天面のハイライト -->
            <path
              :d="`M${CX - W / 2 + 14} ${slabY(i)} L${CX} ${slabY(i) - D / 2 + 7}`"
              stroke="white"
              stroke-opacity="0.3"
              stroke-width="2"
              stroke-linecap="round"
            />
            <!-- ラベル -->
            <path
              :d="`M${CX + W / 2 + 6} ${slabY(i) + 6} h22`"
              :stroke="i < selected.youManage ? 'var(--color-signal)' : 'oklch(1 0 0 / 0.25)'"
              stroke-width="1.5"
              :style="{ transition: `stroke .45s ease ${i * 70}ms` }"
            />
            <text
              :x="CX + W / 2 + 34"
              :y="slabY(i) + 10"
              font-size="13"
              :font-weight="i < selected.youManage ? 700 : 400"
              :fill="i < selected.youManage ? 'white' : 'oklch(1 0 0 / 0.55)'"
            >
              {{ layers[i] }}
            </text>
          </g>
        </g>
      </svg>

      <Transition name="swap" mode="out-in">
        <div :key="selected.id" class="text-white md:pr-4">
          <div class="font-display text-4xl font-bold">{{ selected.name }}</div>
          <div class="mt-1 text-sm text-white/45">{{ selected.full }}</div>
          <p class="mt-6 text-[16px] leading-[1.95] text-white/90">
            <TermText :text="selected.desc" />
          </p>
          <div class="mt-6 text-xs font-bold tracking-wider text-white/40">例</div>
          <ul class="mt-3 flex flex-wrap gap-2">
            <li
              v-for="(br, i) in selected.brands"
              :key="br"
              class="rise-in flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] py-1.5 pr-3.5 pl-2 text-[13px] text-white/85"
              :style="{ animationDelay: `${120 + i * 70}ms` }"
            >
              <span class="flex size-6 items-center justify-center rounded-full bg-white">
                <BrandIcon :name="br" :size="14" />
              </span>
              {{ brands[br].title }}
            </li>
          </ul>
          <p class="mt-3 text-[14px] leading-relaxed text-white/55">{{ selected.examples }}</p>
          <p
            v-if="selected.note"
            class="mt-6 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-[14px] leading-[1.9] text-white/75"
          >
            {{ selected.note }}
          </p>
          <div class="mt-7 flex gap-5 text-xs text-white/60">
            <span class="flex items-center gap-2"
              ><span class="size-3 rounded-sm bg-signal" />自分が管理</span
            >
            <span class="flex items-center gap-2"
              ><span class="size-3 rounded-sm bg-[oklch(0.42_0.06_250)]" />事業者が管理</span
            >
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
