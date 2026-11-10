<script setup lang="ts">
/**
 * ハンズオンの1ステップ。
 * 実行する理由 → コマンド → 期待される出力 → よくあるエラー → 自己チェック の順で見せる。
 */
import AppIcon from "../icons/AppIcon.vue";

const { step, title, why } = defineProps<{ step: number; title: string; why?: string }>();
</script>

<template>
  <section
    data-slide-break
    class="relative my-16 rounded-3xl bg-white px-9 pt-9 pb-8 shadow-[0_0_0_1px_var(--color-line)]"
  >
    <div class="flex items-start gap-5">
      <span
        class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-ink font-display text-xl font-bold text-white"
        >{{ step }}</span
      >
      <div class="pt-0.5">
        <div class="text-xs font-bold tracking-[0.15em] text-ink/40">STEP {{ step }}</div>
        <h3 class="!mt-1 !mb-0 text-xl font-bold text-ink">{{ title }}</h3>
      </div>
    </div>
    <p v-if="why" class="!mt-6 rounded-xl bg-ink/[0.03] px-5 py-3.5 text-[15px] text-ink/70">
      <strong class="mr-1 text-ink">なぜ：</strong>{{ why }}
    </p>
    <div class="mt-2">
      <slot />
    </div>
    <div v-if="$slots.expected" class="mt-10">
      <div class="flex items-center gap-2 text-xs font-bold tracking-[0.15em] text-emerald-700">
        <AppIcon name="eye" :size="16" :stroke="1.9" />期待される結果
      </div>
      <slot name="expected" />
    </div>
    <details
      v-if="$slots.errors"
      class="group mt-10 rounded-2xl border border-line px-6 py-4 text-[15px] open:bg-amber-50/40"
    >
      <summary
        class="flex cursor-pointer list-none items-center gap-3 font-bold text-ink/75 [&::-webkit-details-marker]:hidden"
      >
        <AppIcon name="alert" :size="18" class="text-amber-600" />
        うまくいかないとき
        <AppIcon
          name="plus"
          :size="16"
          :stroke="2"
          class="ml-auto text-ink/40 transition-transform group-open:rotate-45"
        />
      </summary>
      <div class="pt-3"><slot name="errors" /></div>
    </details>
    <div v-if="$slots.check" class="mt-10 border-t border-line pt-7">
      <div class="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.15em] text-ink/45">
        <AppIcon name="checkCircle" :size="16" :stroke="1.9" />自己チェック
      </div>
      <slot name="check" />
    </div>
  </section>
</template>
