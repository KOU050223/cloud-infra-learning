<script setup lang="ts">
import TermText from "../ui/TermText.vue";
import { computed, ref } from "vue";
import AppIcon from "../icons/AppIcon.vue";
import BrandIcon from "../icons/BrandIcon.vue";
import type { BrandName } from "../icons/brands";
import type { IconName } from "../icons/icons";

type BlockId = "compute" | "db" | "storage" | "network" | "identity";

interface Block {
  id: BlockId;
  name: string;
  ja: string;
  icon: IconName;
  x: number;
  y: number;
  role: string;
  inApp: string;
  examples: { vendor: string; brands: BrandName[]; service: string }[];
}

const blocks: Block[] = [
  {
    id: "network",
    name: "Network",
    ja: "ネットワーク",
    icon: "globe",
    x: 275,
    y: 200,
    role: "ユーザーからのリクエストを正しい場所に届ける。DNS・[[cdn|CDN]]・ロードバランサーなど。",
    inApp: "部のドメインで HP を開け、新入生のスマホからでも速く表示される。",
    examples: [
      { vendor: "AWS", brands: ["aws"], service: "Route 53 / CloudFront" },
      { vendor: "Cloudflare", brands: ["cloudflare"], service: "DNS / CDN" },
      { vendor: "Google Cloud", brands: ["googlecloud"], service: "Cloud DNS / Cloud CDN" },
    ],
  },
  {
    id: "compute",
    name: "Compute",
    ja: "計算",
    icon: "cpu",
    x: 490,
    y: 200,
    role: "プログラムを動かす場所。リクエストを受けて処理し、結果を返す。",
    inApp: "「お知らせ一覧を返す」「あいさつを返す」といった API の処理を実行する。",
    examples: [
      { vendor: "AWS", brands: ["aws"], service: "EC2 / Lambda" },
      { vendor: "Google Cloud", brands: ["googlecloud"], service: "Compute Engine / Cloud Run" },
      { vendor: "Cloudflare", brands: ["cloudflare"], service: "Workers" },
      { vendor: "Vercel", brands: ["vercel"], service: "Functions" },
    ],
  },
  {
    id: "identity",
    name: "Identity",
    ja: "認証・認可",
    icon: "key",
    x: 490,
    y: 62,
    role: "「誰か」を確認し（[[authn|認証]]）、「何をしてよいか」を決める（[[authz|認可]]）。",
    inApp: "部員だけがログインして、お知らせを投稿・編集できる。",
    examples: [
      { vendor: "AWS", brands: ["aws"], service: "Cognito / IAM" },
      { vendor: "Firebase", brands: ["firebase"], service: "Authentication" },
      { vendor: "Supabase", brands: ["supabase"], service: "Auth" },
      { vendor: "Clerk / Auth0", brands: ["clerk", "auth0"], service: "認証 SaaS" },
    ],
  },
  {
    id: "db",
    name: "Database",
    ja: "データベース",
    icon: "database",
    x: 735,
    y: 110,
    role: "構造化されたデータを保存し、検索・更新する。",
    inApp: "お知らせのタイトル・本文・日付や、部員の名簿を保存する。",
    examples: [
      { vendor: "AWS", brands: ["aws"], service: "RDS / DynamoDB" },
      { vendor: "Cloudflare", brands: ["cloudflare"], service: "D1 (SQLite)" },
      { vendor: "Supabase / Neon", brands: ["supabase", "neon"], service: "PostgreSQL" },
      { vendor: "TiDB Cloud", brands: ["tidb"], service: "MySQL 互換" },
    ],
  },
  {
    id: "storage",
    name: "Storage",
    ja: "ストレージ",
    icon: "box",
    x: 735,
    y: 290,
    role: "画像・動画・ファイルなど大きなデータをそのまま置いておく。",
    inApp: "活動写真や部誌の PDF など、ファイルそのものを保存する。",
    examples: [
      { vendor: "AWS", brands: ["aws"], service: "S3" },
      { vendor: "Google Cloud", brands: ["googlecloud"], service: "Cloud Storage" },
      { vendor: "Cloudflare", brands: ["cloudflare"], service: "R2" },
      { vendor: "Firebase", brands: ["firebase"], service: "Cloud Storage for Firebase" },
    ],
  },
];

const user = { x: 80, y: 200 };

/** つながり（どのブロックに関係するか） */
const links: { id: string; d: string; ends: BlockId[] }[] = [
  { id: "bb-user-net", d: "M118 200 C 170 200, 190 200, 237 200", ends: ["network"] },
  { id: "bb-net-cmp", d: "M313 200 C 370 200, 400 200, 452 200", ends: ["network", "compute"] },
  { id: "bb-cmp-id", d: "M490 162 C 490 130, 490 120, 490 100", ends: ["compute", "identity"] },
  { id: "bb-cmp-db", d: "M526 186 C 600 150, 640 115, 697 110", ends: ["compute", "db"] },
  { id: "bb-cmp-st", d: "M526 214 C 600 250, 640 285, 697 290", ends: ["compute", "storage"] },
  {
    id: "bb-net-st",
    d: "M300 228 C 380 330, 600 330, 697 296",
    ends: ["network", "storage"],
  },
];

const selectedId = ref<BlockId>("compute");
const selected = computed(() => blocks.find((b) => b.id === selectedId.value)!);
const seen = ref(new Set<BlockId>(["compute"]));

function select(id: BlockId) {
  selectedId.value = id;
  seen.value = new Set([...seen.value, id]);
}

/** ノードの下に並べるロゴ（重複を除く） */
const logosOf = (b: Block) => [...new Set(b.examples.flatMap((e) => e.brands))].slice(0, 4);

const linkActive = (l: (typeof links)[number]) => l.ends.includes(selectedId.value);
</script>

<template>
  <div class="not-prose my-14 xl:-mx-20">
    <div class="flex items-baseline justify-between gap-4">
      <div class="font-bold">例：情報技術研究部の HP を動かすなら？</div>
      <div class="flex items-center gap-2 text-sm text-ink/50">
        <span class="font-display font-bold text-ink">{{ seen.size }}</span> /
        {{ blocks.length }} を確認
      </div>
    </div>

    <div class="stage mt-5">
      <svg viewBox="0 0 860 400" class="block w-full" role="group" aria-label="アプリの構成図">
        <defs>
          <filter id="bb-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <radialGradient id="bb-node" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stop-color="oklch(0.34 0.05 265)" />
            <stop offset="100%" stop-color="oklch(0.24 0.035 265)" />
          </radialGradient>
        </defs>

        <!-- つながりと流れる粒 -->
        <g fill="none" stroke-linecap="round">
          <g v-for="l in links" :key="l.id">
            <path
              :id="l.id"
              :d="l.d"
              :stroke="linkActive(l) ? 'oklch(0.78 0.16 65 / 0.55)' : 'var(--color-stage-line)'"
              stroke-width="2"
              style="transition: stroke 0.4s"
            />
            <circle
              v-for="k in 3"
              :key="k"
              :r="linkActive(l) ? 4 : 2.5"
              :fill="linkActive(l) ? 'var(--color-signal)' : 'oklch(1 0 0 / 0.45)'"
            >
              <animateMotion
                :dur="linkActive(l) ? '1.4s' : '3.2s'"
                repeatCount="indefinite"
                :begin="`-${(k - 1) * (linkActive(l) ? 0.47 : 1.07)}s`"
              >
                <mpath :href="`#${l.id}`" />
              </animateMotion>
            </circle>
          </g>
        </g>

        <!-- ユーザー -->
        <g :transform="`translate(${user.x} ${user.y})`">
          <circle
            r="36"
            fill="oklch(1 0 0 / 0.06)"
            stroke="oklch(1 0 0 / 0.14)"
            stroke-width="1.5"
            stroke-dasharray="4 4"
          />
          <AppIcon name="phone" :x="-16" :y="-16" :size="32" :stroke="1.5" class="text-white/75" />
          <text y="58" text-anchor="middle" font-size="12" fill="oklch(1 0 0 / 0.6)">
            新入生のスマホ
          </text>
        </g>

        <!-- ブロック -->
        <g
          v-for="b in blocks"
          :key="b.id"
          :transform="`translate(${b.x} ${b.y})`"
          role="button"
          tabindex="0"
          class="cursor-pointer"
          :aria-pressed="selectedId === b.id"
          :aria-label="`${b.name}（${b.ja}）`"
          @click="select(b.id)"
          @keydown.enter.prevent="select(b.id)"
          @keydown.space.prevent="select(b.id)"
        >
          <g class="float-y" :style="{ animationDelay: `${b.y * -17}ms` }">
            <template v-if="selectedId === b.id">
              <circle r="38" fill="var(--color-signal)" opacity="0.3" class="pulse-ring" />
              <circle r="46" fill="var(--color-signal)" opacity="0.2" filter="url(#bb-glow)" />
            </template>
            <circle r="46" fill="transparent" />
            <circle
              r="38"
              fill="url(#bb-node)"
              :stroke="selectedId === b.id ? 'var(--color-signal)' : 'oklch(1 0 0 / 0.16)'"
              stroke-width="2"
              style="transition: stroke 0.3s"
            />
            <AppIcon
              :name="b.icon"
              :x="-17"
              :y="-17"
              :size="34"
              :stroke="1.5"
              :style="{
                color: selectedId === b.id ? 'var(--color-signal)' : 'oklch(1 0 0 / 0.8)',
                transition: 'color .3s',
              }"
            />
            <circle
              v-if="seen.has(b.id)"
              cx="27"
              cy="-27"
              r="5"
              fill="var(--color-ok)"
              stroke="var(--color-stage)"
              stroke-width="2.5"
            />
            <text
              :y="b.id === 'identity' ? 6 : 62"
              :x="b.id === 'identity' ? 54 : 0"
              :text-anchor="b.id === 'identity' ? 'start' : 'middle'"
              font-size="14"
              font-weight="700"
              fill="white"
            >
              {{ b.name }}
              <tspan font-size="11" font-weight="400" fill="oklch(1 0 0 / 0.5)" dx="4">
                {{ b.ja }}
              </tspan>
            </text>
            <!-- 代表的なサービスのロゴ -->
            <g
              :transform="
                b.id === 'identity'
                  ? 'translate(54 16)'
                  : `translate(${-(logosOf(b).length * 24 - 8) / 2} 76)`
              "
              :opacity="selectedId === b.id ? 1 : 0.55"
              style="transition: opacity 0.3s"
            >
              <g v-for="(br, k) in logosOf(b)" :key="br" :transform="`translate(${k * 24} 0)`">
                <rect x="-3" y="-3" width="22" height="22" rx="6" fill="oklch(1 0 0 / 0.08)" />
                <BrandIcon :name="br" :size="16" variant="light" />
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>

    <Transition name="swap" mode="out-in">
      <div :key="selected.id" class="mt-8 grid gap-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <div class="flex items-center gap-3">
            <span class="flex size-11 items-center justify-center rounded-2xl bg-ink text-signal">
              <AppIcon :name="selected.icon" :size="22" />
            </span>
            <span>
              <span class="block text-lg font-bold">{{ selected.name }}</span>
              <span class="block text-sm text-ink/50">{{ selected.ja }}</span>
            </span>
          </div>
          <div class="mt-7 text-xs font-bold tracking-wider text-ink/40">役割</div>
          <p class="mt-2 text-[16px] leading-[1.95]"><TermText :text="selected.role" /></p>
          <div class="mt-6 text-xs font-bold tracking-wider text-ink/40">部の HP では</div>
          <p class="mt-2 text-[16px] leading-[1.95]"><TermText :text="selected.inApp" /></p>
        </div>
        <div>
          <div class="text-xs font-bold tracking-wider text-ink/40">代表的なサービス</div>
          <ul class="mt-3 space-y-2">
            <li
              v-for="(e, i) in selected.examples"
              :key="e.vendor + e.service"
              class="rise-in flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-3 text-[14px] shadow-[0_0_0_1px_var(--color-line)]"
              :style="{ animationDelay: `${i * 60}ms` }"
            >
              <span class="flex items-center gap-2.5 text-ink/60">
                <span class="flex -space-x-1">
                  <span
                    v-for="br in e.brands"
                    :key="br"
                    class="flex size-7 items-center justify-center rounded-lg bg-white shadow-[0_0_0_1px_var(--color-line)]"
                  >
                    <BrandIcon :name="br" :size="15" />
                  </span>
                </span>
                {{ e.vendor }}
              </span>
              <span class="text-right font-bold">{{ e.service }}</span>
            </li>
          </ul>
        </div>
      </div>
    </Transition>
  </div>
</template>
