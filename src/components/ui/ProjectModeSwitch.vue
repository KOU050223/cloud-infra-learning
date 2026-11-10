<script setup lang="ts">
import { useProgressStore } from "../../stores/progress";

const progress = useProgressStore();
const options = [
  {
    value: "template",
    title: "共通テンプレートを使う",
    desc: "迷ったらこちら。build の設定も用意済みで、手順どおりに進められます。",
  },
  {
    value: "own",
    title: "自分の Hono API を使う",
    desc: "前講座などで作った API を持ち込みます。詰まったらいつでもテンプレートに切り替えてOK。",
  },
] as const;
</script>

<template>
  <div class="not-prose my-10 grid gap-4 md:grid-cols-2">
    <button
      v-for="o in options"
      :key="o.value"
      type="button"
      class="rounded-2xl border-2 bg-white p-6 text-left transition"
      :class="
        progress.projectMode === o.value
          ? 'border-brand-500 ring-4 ring-brand-100'
          : 'border-line hover:border-ink/25'
      "
      :aria-pressed="progress.projectMode === o.value"
      @click="progress.setProjectMode(o.value)"
    >
      <span class="block text-[16px] font-bold">{{ o.title }}</span>
      <span class="mt-2 block text-[15px] leading-[1.85] text-ink/65">{{ o.desc }}</span>
    </button>
  </div>
</template>
