<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from "vue-router";
import { kindLabel, sessions } from "./data/course";
import { useProgressStore } from "./stores/progress";

const progress = useProgressStore();
const route = useRoute();
</script>

<template>
  <div class="flex min-h-screen">
    <aside
      class="sticky top-0 flex h-screen w-72 shrink-0 flex-col border-r border-slate-200 bg-white"
    >
      <RouterLink to="/" class="block border-b border-slate-200 px-5 py-4">
        <div class="text-xs font-semibold tracking-wider text-brand-600">CLOUD INFRA 101</div>
        <div class="mt-0.5 text-lg font-bold text-slate-900">クラウドインフラ入門</div>
      </RouterLink>

      <div class="border-b border-slate-200 px-5 py-3">
        <div class="flex justify-between text-xs text-slate-500">
          <span>進捗</span>
          <span>{{ progress.completedCount }} / 12</span>
        </div>
        <div class="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            class="h-full rounded-full bg-brand-500 transition-all"
            :style="{ width: `${progress.percent}%` }"
          />
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto px-3 py-3">
        <div v-for="s in sessions" :key="s.id" class="mb-4">
          <div class="px-2 pb-1 text-xs font-bold text-slate-400">第{{ s.id }}回</div>
          <RouterLink
            v-for="l in s.lessons"
            :key="l.id"
            :to="`/lessons/${l.id}`"
            class="flex items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-100"
            :class="
              route.params.id === l.id
                ? 'bg-brand-50 font-semibold text-brand-700'
                : 'text-slate-700'
            "
          >
            <span
              class="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border text-[10px]"
              :class="
                progress.isCompleted(l.id)
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-slate-300'
              "
              :aria-label="progress.isCompleted(l.id) ? '完了' : '未完了'"
            >
              <template v-if="progress.isCompleted(l.id)">✓</template>
            </span>
            <span class="flex-1">
              <span class="font-mono text-xs text-slate-400">{{ l.id }}</span>
              {{ l.title }}
              <span class="block text-[11px] font-normal text-slate-400">{{
                kindLabel[l.kind]
              }}</span>
            </span>
          </RouterLink>
        </div>
      </nav>
    </aside>

    <main class="min-w-0 flex-1">
      <RouterView />
    </main>
  </div>
</template>
