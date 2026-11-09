<script setup lang="ts">
/**
 * ハンズオンの1ステップ。
 * 実行する理由 → コマンド → 期待される出力 → よくあるエラー → 自己チェック の順で見せる。
 */
const { step, title, why } = defineProps<{ step: number; title: string; why?: string }>();
</script>

<template>
  <section class="my-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <h3 class="!mt-0 flex items-center gap-3 text-base font-bold text-slate-900">
      <span
        class="flex size-7 items-center justify-center rounded-full bg-brand-600 text-sm text-white"
        >{{ step }}</span
      >
      {{ title }}
    </h3>
    <p v-if="why" class="text-sm text-slate-600"><strong>なぜ：</strong>{{ why }}</p>
    <slot />
    <div v-if="$slots.expected" class="mt-4">
      <div class="text-xs font-bold text-slate-500">期待される結果</div>
      <slot name="expected" />
    </div>
    <details v-if="$slots.errors" class="mt-4 rounded-lg bg-slate-50 px-4 py-2 text-sm">
      <summary class="cursor-pointer font-semibold text-slate-700">うまくいかないとき</summary>
      <div class="pt-2"><slot name="errors" /></div>
    </details>
    <div v-if="$slots.check" class="mt-4">
      <div class="text-xs font-bold text-slate-500">自己チェック</div>
      <slot name="check" />
    </div>
  </section>
</template>
