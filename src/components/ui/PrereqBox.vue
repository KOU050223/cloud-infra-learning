<script setup lang="ts">
import AppIcon from "../icons/AppIcon.vue";

/** 手順の前に置く「前提の確認」。知っている人は開かずに進める */
const { title } = defineProps<{ title: string }>();
</script>

<template>
  <details
    class="group my-10 rounded-2xl border-2 border-dashed border-ink/12 bg-white/60 px-6 py-4 open:border-solid open:border-brand-100 open:bg-white"
  >
    <summary
      class="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden"
    >
      <span
        class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"
      >
        <AppIcon name="layers" :size="17" :stroke="1.9" />
      </span>
      <span>
        <span class="block text-[11px] font-bold tracking-[0.15em] text-brand-600">前提の確認</span>
        <span class="block font-bold">{{ title }}</span>
      </span>
      <span class="ml-auto flex items-center gap-3">
        <span class="text-xs text-ink/40 group-open:hidden">知っていれば飛ばして OK</span>
        <AppIcon
          name="plus"
          :size="16"
          :stroke="2"
          class="text-ink/40 transition-transform group-open:rotate-45"
        />
      </span>
    </summary>
    <div class="prose-lesson mt-4 pb-2">
      <slot />
    </div>
  </details>
</template>
