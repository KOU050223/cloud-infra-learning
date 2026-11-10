<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from "vue-router";
import { kindLabel, sessions } from "./data/course";
import AppIcon from "./components/icons/AppIcon.vue";
import { useProgressStore } from "./stores/progress";

const progress = useProgressStore();
const route = useRoute();
</script>

<template>
  <div class="flex min-h-screen">
    <aside
      v-show="!(progress.slideMode && route.name === 'lesson')"
      class="sticky top-0 flex h-screen w-[19rem] shrink-0 flex-col border-r border-line bg-white/70 backdrop-blur"
    >
      <RouterLink to="/" class="group flex items-center gap-3.5 px-7 pt-8 pb-7">
        <span
          class="flex size-10 items-center justify-center rounded-xl bg-ink text-signal transition group-hover:rotate-[-6deg]"
        >
          <AppIcon name="cloud" :size="22" :stroke="1.8" />
        </span>
        <span>
          <span class="block font-display text-[11px] font-bold tracking-[0.2em] text-brand-600"
            >CLOUD INFRA 101</span
          >
          <span class="block text-[17px] font-bold text-ink">クラウドインフラ入門</span>
        </span>
      </RouterLink>

      <div class="mx-7 mb-6 rounded-2xl bg-ink/[0.04] px-5 py-4">
        <div class="flex items-baseline justify-between text-xs text-ink/55">
          <span class="font-bold">進捗</span>
          <span
            ><span class="font-display text-base font-bold text-ink">{{
              progress.completedCount
            }}</span>
            / 12</span
          >
        </div>
        <div class="mt-2.5 h-1.5 overflow-hidden rounded-full bg-ink/10">
          <div
            class="h-full rounded-full bg-brand-500 transition-all duration-700"
            :style="{ width: `${progress.percent}%` }"
          />
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto px-4 pb-10">
        <div v-for="s in sessions" :key="s.id" class="mb-8">
          <div class="px-3 pb-3 text-[11px] font-bold tracking-[0.18em] text-ink/35">
            SESSION {{ s.id }}
          </div>
          <RouterLink
            v-for="l in s.lessons"
            :key="l.id"
            :to="`/lessons/${l.id}`"
            class="relative mb-1 flex items-start gap-3 rounded-xl px-3 py-2.5 text-[14px] leading-snug transition"
            :class="
              route.params.id === l.id
                ? 'bg-ink text-white'
                : 'text-ink/75 hover:bg-ink/[0.04] hover:text-ink'
            "
          >
            <span
              class="mt-px flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition"
              :class="
                progress.isCompleted(l.id)
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : route.params.id === l.id
                    ? 'border-white/40'
                    : 'border-ink/20'
              "
              :aria-label="progress.isCompleted(l.id) ? '完了' : '未完了'"
            >
              <AppIcon v-if="progress.isCompleted(l.id)" name="check" :size="12" :stroke="3" />
            </span>
            <span class="flex-1">
              <span
                class="mr-1 font-display text-xs"
                :class="route.params.id === l.id ? 'text-signal' : 'text-ink/35'"
                >{{ l.id }}</span
              >
              {{ l.title }}
              <span
                class="mt-1 block text-[11px]"
                :class="route.params.id === l.id ? 'text-white/50' : 'text-ink/35'"
                >{{ kindLabel[l.kind] }}</span
              >
            </span>
          </RouterLink>
        </div>
      </nav>

      <RouterLink
        to="/glossary"
        class="mx-4 mb-5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition"
        :class="route.name === 'glossary' ? 'bg-ink text-white' : 'text-ink/70 hover:bg-ink/[0.04]'"
      >
        <AppIcon name="book" :size="18" />
        用語集
      </RouterLink>
    </aside>

    <main class="min-w-0 flex-1">
      <RouterView />
    </main>
  </div>
</template>
