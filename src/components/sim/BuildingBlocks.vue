<script setup lang="ts">
import { computed, ref } from "vue";

interface Block {
  id: string;
  name: string;
  ja: string;
  icon: string;
  role: string;
  inApp: string;
  examples: { vendor: string; service: string }[];
}

const blocks: Block[] = [
  {
    id: "compute",
    name: "Compute",
    ja: "計算",
    icon: "⚙️",
    role: "プログラムを動かす場所。リクエストを受けて処理し、結果を返す。",
    inApp: "「写真を投稿」「一覧を取得」といった API の処理を実行する。",
    examples: [
      { vendor: "AWS", service: "EC2 / Lambda" },
      { vendor: "Google Cloud", service: "Compute Engine / Cloud Run" },
      { vendor: "Cloudflare", service: "Workers" },
      { vendor: "Vercel", service: "Functions" },
    ],
  },
  {
    id: "db",
    name: "Database",
    ja: "データベース",
    icon: "🗄️",
    role: "構造化されたデータを保存し、検索・更新する。",
    inApp: "ユーザー情報、投稿のタイトル、いいね数などを保存する。",
    examples: [
      { vendor: "AWS", service: "RDS / DynamoDB" },
      { vendor: "Cloudflare", service: "D1 (SQLite)" },
      { vendor: "Supabase / Neon", service: "PostgreSQL" },
      { vendor: "TiDB Cloud", service: "MySQL 互換" },
    ],
  },
  {
    id: "storage",
    name: "Storage",
    ja: "ストレージ",
    icon: "📦",
    role: "画像・動画・ファイルなど大きなデータをそのまま置いておく。",
    inApp: "投稿された写真ファイルそのものを保存する。",
    examples: [
      { vendor: "AWS", service: "S3" },
      { vendor: "Google Cloud", service: "Cloud Storage" },
      { vendor: "Cloudflare", service: "R2" },
      { vendor: "Firebase", service: "Cloud Storage for Firebase" },
    ],
  },
  {
    id: "network",
    name: "Network",
    ja: "ネットワーク",
    icon: "🌐",
    role: "ユーザーからのリクエストを正しい場所に届ける。DNS・CDN・ロードバランサーなど。",
    inApp: "独自ドメインでアクセスでき、写真が世界中どこからでも速く表示される。",
    examples: [
      { vendor: "AWS", service: "Route 53 / CloudFront" },
      { vendor: "Cloudflare", service: "DNS / CDN" },
      { vendor: "Google Cloud", service: "Cloud DNS / Cloud CDN" },
    ],
  },
  {
    id: "identity",
    name: "Identity",
    ja: "認証・認可",
    icon: "🔑",
    role: "「誰か」を確認し（認証）、「何をしてよいか」を決める（認可）。",
    inApp: "ログインした本人だけが自分の投稿を削除できる。",
    examples: [
      { vendor: "AWS", service: "Cognito / IAM" },
      { vendor: "Firebase", service: "Authentication" },
      { vendor: "Supabase", service: "Auth" },
      { vendor: "Clerk / Auth0", service: "認証 SaaS" },
    ],
  },
];

const selectedId = ref<string>("compute");
const selected = computed(() => blocks.find((b) => b.id === selectedId.value)!);
const seen = ref(new Set<string>(["compute"]));

function select(id: string) {
  selectedId.value = id;
  seen.value = new Set([...seen.value, id]);
}
</script>

<template>
  <div class="not-prose my-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="flex items-center justify-between">
      <div class="text-sm font-semibold text-slate-700">例：部活の写真共有アプリを作るなら？</div>
      <div class="text-xs text-slate-500">{{ seen.size }} / {{ blocks.length }} を確認</div>
    </div>

    <div class="mt-4 grid grid-cols-5 gap-2">
      <button
        v-for="b in blocks"
        :key="b.id"
        type="button"
        class="relative flex flex-col items-center rounded-xl border-2 px-2 py-3 transition"
        :class="
          selectedId === b.id
            ? 'border-brand-500 bg-brand-50'
            : 'border-slate-200 hover:border-slate-300'
        "
        @click="select(b.id)"
      >
        <span class="text-2xl">{{ b.icon }}</span>
        <span class="mt-1 text-sm font-bold text-slate-900">{{ b.name }}</span>
        <span class="text-[11px] text-slate-500">{{ b.ja }}</span>
        <span
          v-if="seen.has(b.id)"
          class="absolute top-1.5 right-1.5 size-2 rounded-full bg-emerald-500"
          aria-label="確認済み"
        />
      </button>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-5 text-sm">
      <div>
        <div class="text-xs font-bold text-slate-500">役割</div>
        <p class="mt-1">{{ selected.role }}</p>
        <div class="mt-3 text-xs font-bold text-slate-500">写真共有アプリでは</div>
        <p class="mt-1">{{ selected.inApp }}</p>
      </div>
      <div>
        <div class="text-xs font-bold text-slate-500">代表的なサービス</div>
        <table class="mt-1 w-full text-sm">
          <tbody>
            <tr v-for="e in selected.examples" :key="e.vendor + e.service">
              <td class="py-1 pr-3 text-slate-500">{{ e.vendor }}</td>
              <td class="py-1 font-medium">{{ e.service }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
