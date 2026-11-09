<script setup lang="ts">
import { computed, ref } from "vue";

const layers = ["アプリのコード", "データ", "ランタイム", "OS", "サーバー・ネットワーク"] as const;

interface Model {
  id: string;
  name: string;
  full: string;
  /** 利用者が管理する層の数（上から） */
  youManage: number;
  desc: string;
  examples: string;
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
  },
  {
    id: "iaas",
    name: "IaaS",
    full: "Infrastructure as a Service",
    youManage: 4,
    desc: "仮想マシンを借りる。OS から上は自分で面倒を見る。",
    examples: "AWS EC2、Google Compute Engine、Azure VM",
  },
  {
    id: "paas",
    name: "PaaS",
    full: "Platform as a Service",
    youManage: 2,
    desc: "コードを渡せば動かしてくれる。OS やランタイムの更新は事業者まかせ。",
    examples: "Render、Heroku、Google App Engine",
  },
  {
    id: "faas",
    name: "FaaS",
    full: "Function as a Service",
    youManage: 2,
    desc: "関数単位でリクエストが来たときだけ動く。サーバーの存在を意識しない（サーバーレス）。",
    examples: "Cloudflare Workers、AWS Lambda、Vercel Functions",
    note: "PaaS との違いは「常駐しない・リクエスト単位で課金・自動スケール」。データは別サービスに置く。",
  },
  {
    id: "baas",
    name: "BaaS",
    full: "Backend as a Service",
    youManage: 1,
    desc: "認証・DB・ストレージなどバックエンドの機能を API で丸ごと使う。",
    examples: "Firebase、Supabase",
    note: "サーバー側のコードをほぼ書かずに済む一方、データ設計とアクセスルールは自分の責任。",
  },
  {
    id: "saas",
    name: "SaaS",
    full: "Software as a Service",
    youManage: 0,
    desc: "完成したソフトウェアを使うだけ。",
    examples: "Gmail、Notion、Slack、GitHub",
  },
];

const selectedId = ref("faas");
const selected = computed(() => models.find((m) => m.id === selectedId.value)!);
</script>

<template>
  <div class="not-prose my-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="flex flex-wrap gap-2">
      <button
        v-for="m in models"
        :key="m.id"
        type="button"
        class="rounded-full border px-4 py-1.5 text-sm font-semibold transition"
        :class="
          selectedId === m.id
            ? 'border-brand-600 bg-brand-600 text-white'
            : 'border-slate-300 text-slate-700 hover:border-brand-500'
        "
        @click="selectedId = m.id"
      >
        {{ m.name }}
      </button>
    </div>

    <div class="mt-5 grid grid-cols-[220px_1fr] gap-6">
      <div class="space-y-1.5">
        <div
          v-for="(layer, i) in layers"
          :key="layer"
          class="rounded-md px-3 py-2.5 text-center text-sm font-medium transition-colors duration-300"
          :class="
            i < selected.youManage ? 'bg-amber-400 text-amber-950' : 'bg-sky-100 text-sky-800'
          "
        >
          {{ layer }}
        </div>
        <div class="flex justify-center gap-4 pt-2 text-xs">
          <span class="flex items-center gap-1"
            ><span class="size-3 rounded bg-amber-400" />自分が管理</span
          >
          <span class="flex items-center gap-1"
            ><span class="size-3 rounded bg-sky-100" />事業者が管理</span
          >
        </div>
      </div>
      <div class="text-sm">
        <div class="text-lg font-bold text-slate-900">
          {{ selected.name }}
          <span class="ml-1 text-sm font-normal text-slate-500">{{ selected.full }}</span>
        </div>
        <p class="mt-2">{{ selected.desc }}</p>
        <div class="mt-3 text-xs font-bold text-slate-500">例</div>
        <p class="mt-0.5">{{ selected.examples }}</p>
        <p v-if="selected.note" class="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-slate-600">
          {{ selected.note }}
        </p>
      </div>
    </div>
  </div>
</template>
