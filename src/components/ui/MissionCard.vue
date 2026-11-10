<script setup lang="ts">
import AppIcon from "../icons/AppIcon.vue";

/** レッスン冒頭の依頼カード：物語の場面と、このレッスンのゴール */
const { chapter, scene, goal } = defineProps<{ chapter: string; scene: string; goal: string }>();
</script>

<template>
  <section
    class="relative mt-14 overflow-hidden rounded-3xl bg-white shadow-[0_0_0_1px_var(--color-line)]"
    aria-label="このレッスンの依頼"
  >
    <div class="flex items-start gap-4 px-7 pt-7 pb-6">
      <span
        class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-signal/15 text-[oklch(0.6_0.16_60)]"
      >
        <AppIcon name="chat" :size="22" :stroke="1.8" />
      </span>
      <div>
        <div class="text-[11px] font-bold tracking-[0.15em] text-ink/40">
          STORY ・ {{ chapter }}
        </div>
        <p class="mt-2 text-[15.5px] leading-[1.95] text-ink/80">{{ scene }}</p>
      </div>
    </div>
    <div class="flex items-start gap-4 border-t border-dashed border-line bg-brand-50/50 px-7 py-5">
      <span
        class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-600"
      >
        <AppIcon name="target" :size="22" :stroke="1.8" />
      </span>
      <div>
        <div class="text-[11px] font-bold tracking-[0.15em] text-brand-600">
          このレッスンのゴール
        </div>
        <p class="mt-1.5 text-[15.5px] leading-[1.8] font-bold">{{ goal }}</p>
      </div>
    </div>
  </section>
</template>
