<script setup lang="ts">
import { useProgressStore } from "../../stores/progress";

const progress = useProgressStore();
const options = [
  {
    value: "template",
    title: "共通テンプレートを使う",
    desc: "迷ったらこちら。テストも用意済みで、手順どおりに進められます。",
  },
  {
    value: "own",
    title: "自分の Hono API を使う",
    desc: "前講座などで作った API を持ち込みます。詰まったらいつでもテンプレートに切り替えてOK。",
  },
] as const;
</script>

<template>
  <div class="my-5 grid grid-cols-2 gap-3">
    <button
      v-for="o in options"
      :key="o.value"
      type="button"
      class="rounded-xl border-2 bg-white p-4 text-left transition"
      :class="
        progress.projectMode === o.value
          ? 'border-brand-500 ring-4 ring-brand-100'
          : 'border-slate-200 hover:border-slate-300'
      "
      :aria-pressed="progress.projectMode === o.value"
      @click="progress.setProjectMode(o.value)"
    >
      <span class="block font-bold text-slate-900">{{ o.title }}</span>
      <span class="block mt-1 text-sm text-slate-600">{{ o.desc }}</span>
    </button>
  </div>
</template>
