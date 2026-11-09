<script setup lang="ts">
import { computed, defineAsyncComponent, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { findLesson, kindLabel, neighbors, sessions } from "../data/course";
import { useProgressStore } from "../stores/progress";

const route = useRoute();
const router = useRouter();
const progress = useProgressStore();

const id = computed(() => String(route.params.id));
const lesson = computed(() => findLesson(id.value));
const session = computed(() => sessions.find((s) => s.lessons.some((l) => l.id === id.value)));
const nav = computed(() => neighbors(id.value));
const body = computed(() =>
  lesson.value ? defineAsyncComponent(lesson.value.component) : undefined,
);
const done = computed(() => progress.isCompleted(id.value));

watch(id, (v) => progress.visit(v), { immediate: true });

function completeAndNext() {
  progress.setCompleted(id.value, true);
  const next = nav.value.next;
  void router.push(next ? `/lessons/${next.id}` : "/complete");
}
</script>

<template>
  <article v-if="lesson" class="mx-auto max-w-3xl px-10 py-10">
    <div class="text-sm text-slate-500">
      {{ session?.title }}
    </div>
    <h1 class="mt-1 flex items-baseline gap-3 text-2xl font-bold text-slate-900">
      <span class="font-mono text-brand-500">{{ lesson.id }}</span>
      {{ lesson.title }}
    </h1>
    <div class="mt-2 flex gap-2 text-xs">
      <span class="rounded-full bg-brand-50 px-2.5 py-0.5 text-brand-700">{{
        kindLabel[lesson.kind]
      }}</span>
      <span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-600"
        >進行：{{ lesson.pace }}</span
      >
      <span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-600">{{ lesson.time }}</span>
    </div>

    <div class="prose-lesson mt-6">
      <component :is="body" :key="lesson.id" />
    </div>

    <footer class="mt-14 border-t border-slate-200 pt-6">
      <div class="flex items-center justify-between gap-4">
        <RouterLink
          v-if="nav.prev"
          :to="`/lessons/${nav.prev.id}`"
          class="text-sm text-slate-500 hover:text-slate-800"
          >← {{ nav.prev.id }} {{ nav.prev.title }}</RouterLink
        >
        <span v-else />
        <div class="flex items-center gap-3">
          <button
            v-if="done"
            type="button"
            class="text-sm text-slate-400 underline hover:text-slate-600"
            @click="progress.setCompleted(lesson.id, false)"
          >
            未完了に戻す
          </button>
          <button
            type="button"
            class="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-brand-700"
            @click="completeAndNext"
          >
            {{ done ? "次へ" : "このレッスンを完了" }}
            <template v-if="nav.next"> → {{ nav.next.id }}</template>
          </button>
        </div>
      </div>
    </footer>
  </article>
</template>
