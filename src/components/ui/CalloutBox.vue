<script setup lang="ts">
const { tone = "info", title } = defineProps<{ tone?: "info" | "warn" | "tip"; title?: string }>();
const styles = {
  info: "border-sky-200 bg-sky-50 text-sky-950",
  warn: "border-amber-300 bg-amber-50 text-amber-950",
  tip: "border-emerald-200 bg-emerald-50 text-emerald-950",
} as const;
const icons = { info: "💡", warn: "⚠️", tip: "✅" } as const;
</script>

<template>
  <div class="my-5 rounded-xl border px-5 py-4 text-sm" :class="styles[tone]">
    <div v-if="title" class="mb-1 font-bold">{{ icons[tone] }} {{ title }}</div>
    <slot />
  </div>
</template>
