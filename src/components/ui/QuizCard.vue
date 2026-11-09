<script setup lang="ts">
import { computed, ref } from "vue";

export interface QuizOption {
  label: string;
  correct?: boolean;
  /** 選んだときに出す解説 */
  explain: string;
}

const { question, options } = defineProps<{ question: string; options: QuizOption[] }>();
const picked = ref<number | null>(null);
const chosen = computed(() => (picked.value === null ? null : options[picked.value]));
</script>

<template>
  <div class="not-prose my-6 rounded-xl border border-brand-100 bg-brand-50/60 p-5">
    <div class="text-xs font-bold tracking-wider text-brand-600">確認クイズ</div>
    <p class="mt-1 font-semibold text-slate-900">{{ question }}</p>
    <div class="mt-3 grid gap-2">
      <button
        v-for="(o, i) in options"
        :key="o.label"
        type="button"
        class="rounded-lg border bg-white px-4 py-2.5 text-left text-sm transition"
        :class="
          picked === i
            ? o.correct
              ? 'border-emerald-500 ring-2 ring-emerald-200'
              : 'border-rose-400 ring-2 ring-rose-100'
            : 'border-slate-200 hover:border-brand-500'
        "
        @click="picked = i"
      >
        {{ o.label }}
      </button>
    </div>
    <p
      v-if="chosen"
      class="mt-3 rounded-lg px-4 py-3 text-sm"
      :class="chosen.correct ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'"
      role="status"
    >
      <strong>{{ chosen.correct ? "正解！" : "もう一度考えてみよう" }}</strong>
      {{ chosen.explain }}
    </p>
  </div>
</template>
