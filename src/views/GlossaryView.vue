<script setup lang="ts">
import { RouterLink } from "vue-router";
import { findLesson } from "../data/course";
import { glossary } from "../data/glossary";

const entries = Object.entries(glossary).map(([id, e]) => ({
  id,
  ...e,
  lessonTitle: e.lesson ? findLesson(e.lesson)?.title : undefined,
}));
</script>

<template>
  <div class="mx-auto max-w-[46rem] px-8 pt-20 pb-28 lg:px-0">
    <div class="font-display text-xs font-bold tracking-[0.2em] text-brand-600">GLOSSARY</div>
    <h1 class="mt-3 text-[2.1rem] font-bold">用語集</h1>
    <p class="mt-6 text-[16px] leading-[2] text-ink/70">
      レッスン中の点線の付いた用語を、まとめて見られます。関係の深いレッスンから順に並べています。
    </p>
    <dl class="mt-12 space-y-3">
      <div
        v-for="e in entries"
        :id="e.id"
        :key="e.id"
        class="scroll-mt-8 rounded-2xl bg-white px-7 py-6 shadow-[0_0_0_1px_var(--color-line)]"
      >
        <dt class="flex flex-wrap items-baseline justify-between gap-3">
          <span class="text-[17px] font-bold">{{ e.term }}</span>
          <RouterLink
            v-if="e.lesson"
            :to="`/lessons/${e.lesson}`"
            class="text-[13px] text-brand-600 underline-offset-4 hover:underline"
            >{{ e.lesson }} {{ e.lessonTitle }}</RouterLink
          >
        </dt>
        <dd class="mt-2 text-[15px] leading-[1.9] text-ink/70">{{ e.desc }}</dd>
      </div>
    </dl>
  </div>
</template>
