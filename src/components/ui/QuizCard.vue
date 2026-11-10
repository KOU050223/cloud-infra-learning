<script setup lang="ts">
import { computed, ref } from "vue";
import AppIcon from "../icons/AppIcon.vue";

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
  <div
    data-slide-break
    class="not-prose my-16 rounded-3xl bg-white p-8 shadow-[0_0_0_1px_var(--color-line)]"
  >
    <div class="flex items-center gap-2.5 text-xs font-bold tracking-[0.15em] text-brand-600">
      <AppIcon name="question" :size="18" :stroke="1.9" />
      確認クイズ
    </div>
    <p class="mt-4 text-[17px] leading-[1.85] font-bold">{{ question }}</p>
    <div class="mt-7 grid gap-3">
      <button
        v-for="(o, i) in options"
        :key="o.label"
        type="button"
        class="group flex items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left text-[15px] leading-relaxed transition"
        :class="
          picked === i
            ? o.correct
              ? 'border-emerald-500 bg-emerald-50/60'
              : 'shake border-rose-400 bg-rose-50/60'
            : 'border-line hover:border-brand-300 hover:bg-brand-50/40'
        "
        @click="picked = i"
      >
        <span
          class="flex size-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold transition"
          :class="
            picked === i
              ? o.correct
                ? 'bg-emerald-500 text-white'
                : 'bg-rose-500 text-white'
              : 'bg-ink/[0.05] text-ink/50 group-hover:bg-brand-100 group-hover:text-brand-700'
          "
        >
          <AppIcon
            v-if="picked === i"
            :name="o.correct ? 'check' : 'cross'"
            :size="16"
            :stroke="2.5"
          />
          <template v-else>{{ "ABCDEF"[i] }}</template>
        </span>
        {{ o.label }}
      </button>
    </div>
    <Transition name="swap" mode="out-in">
      <p
        v-if="chosen"
        :key="picked ?? -1"
        class="mt-6 rounded-2xl px-6 py-5 text-[15px] leading-[1.95]"
        :class="chosen.correct ? 'bg-emerald-50 text-emerald-950' : 'bg-rose-50 text-rose-950'"
        role="status"
      >
        <strong class="mb-1 block">{{ chosen.correct ? "正解！" : "もう一度考えてみよう" }}</strong>
        {{ chosen.explain }}
      </p>
    </Transition>
  </div>
</template>
