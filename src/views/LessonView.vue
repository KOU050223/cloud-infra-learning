<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
  watch,
} from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { findLesson, kindLabel, neighbors, sessions } from "../data/course";
import AppIcon from "../components/icons/AppIcon.vue";
import TerminalDock from "../components/sim/TerminalDock.vue";
import MissionCard from "../components/ui/MissionCard.vue";
import { useSlides } from "../composables/useSlides";
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

// --- スライドモード ---
const bodyEl = useTemplateRef<HTMLElement>("bodyEl");
const slideMode = computed(() => progress.slideMode);
const slides = useSlides(bodyEl, slideMode);
const onFirst = computed(() => !slideMode.value || slides.index.value === 0);
const onLast = computed(() => !slideMode.value || slides.index.value >= slides.count.value - 1);

async function toggleMode() {
  if (slideMode.value) {
    // スクロール表示に戻したら、見ていたスライドの位置を表示する
    const el = slides.firstElementOfCurrent();
    progress.setSlideMode(false);
    await nextTick();
    el?.scrollIntoView({ block: "start" });
  } else {
    progress.setSlideMode(true);
    window.scrollTo({ top: 0 });
  }
}

const fullscreen = ref(false);
const syncFullscreen = () => (fullscreen.value = !!document.fullscreenElement);
onMounted(() => document.addEventListener("fullscreenchange", syncFullscreen));
onBeforeUnmount(() => document.removeEventListener("fullscreenchange", syncFullscreen));
function toggleFullscreen() {
  if (document.fullscreenElement) void document.exitFullscreen();
  else void document.documentElement.requestFullscreen?.();
}

function completeAndNext() {
  progress.setCompleted(id.value, true);
  const next = nav.value.next;
  void router.push(next ? `/lessons/${next.id}` : "/complete");
}
</script>

<template>
  <article
    v-if="lesson"
    class="mx-auto max-w-[46rem] px-5 sm:px-8 lg:px-0"
    :class="slideMode ? 'pt-10 pb-44' : 'pt-20 pb-24'"
  >
    <!-- 表示の切り替え -->
    <div class="mb-10 flex items-center justify-end gap-2">
      <RouterLink
        v-if="slideMode"
        to="/"
        class="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[13px] text-ink/50 transition hover:bg-ink/[0.05] hover:text-ink"
      >
        <AppIcon name="arrowLeft" :size="15" :stroke="2" />
        コース一覧
      </RouterLink>
      <span v-if="slideMode && !onFirst" class="mr-auto truncate text-sm text-ink/45">
        <span class="font-display font-bold text-brand-500">{{ lesson.id }}</span>
        {{ lesson.title }}
      </span>
      <button
        v-if="slideMode"
        type="button"
        class="flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] text-ink/55 transition hover:bg-ink/[0.05] hover:text-ink"
        @click="toggleFullscreen"
      >
        <AppIcon :name="fullscreen ? 'collapse' : 'expand'" :size="15" :stroke="2" />
        {{ fullscreen ? "全画面を終了" : "全画面" }}
      </button>
      <button
        type="button"
        class="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-bold text-ink/75 shadow-[0_0_0_1px_var(--color-line)] transition hover:text-ink hover:shadow-[0_0_0_1px_var(--color-brand-300)]"
        :aria-pressed="slideMode"
        @click="toggleMode"
      >
        <AppIcon :name="slideMode ? 'list' : 'slides'" :size="16" :stroke="1.9" />
        {{ slideMode ? "スクロールで見る" : "スライドで見る" }}
      </button>
    </div>

    <header v-show="onFirst">
      <div class="text-sm tracking-wide text-ink/50">
        {{ session?.title }}
      </div>
      <div class="mt-8 font-display text-6xl leading-none font-bold text-brand-500/90">
        {{ lesson.id }}
      </div>
      <h1 class="mt-5 text-[1.75rem] sm:text-[2.1rem] leading-[1.4] font-bold text-ink">
        {{ lesson.title }}
      </h1>
      <div class="mt-6 flex flex-wrap gap-2.5 text-[13px]">
        <span class="rounded-full bg-brand-50 px-3.5 py-1 font-bold text-brand-700">{{
          kindLabel[lesson.kind]
        }}</span>
        <span class="rounded-full bg-ink/[0.05] px-3.5 py-1 text-ink/65"
          >進行：{{ lesson.pace }}</span
        >
        <span class="rounded-full bg-ink/[0.05] px-3.5 py-1 text-ink/65">{{ lesson.time }}</span>
      </div>
      <MissionCard
        :chapter="`第${session?.id}章 ${session?.chapter.title}`"
        :scene="lesson.mission.scene"
        :goal="lesson.mission.goal"
      />
    </header>

    <div
      ref="bodyEl"
      class="prose-lesson"
      :class="[onFirst ? 'mt-16' : 'mt-0', slideMode ? 'slide-on min-h-[55vh]' : '']"
    >
      <component :is="body" :key="lesson.id" />
    </div>

    <!-- スライドの操作 -->
    <div
      v-if="slideMode && slides.count.value > 0"
      class="fixed bottom-5 left-1/2 z-30 w-[min(46rem,calc(100vw-2rem))] -translate-x-1/2"
    >
      <nav
        class="flex items-center gap-4 rounded-full bg-ink/95 py-2.5 pr-2.5 pl-3 text-white shadow-[0_18px_40px_-14px_oklch(0.2_0.05_265_/_0.6)] backdrop-blur"
        aria-label="スライドの操作"
      >
        <button
          type="button"
          class="flex size-10 items-center justify-center rounded-full transition hover:bg-white/10 disabled:opacity-30"
          :disabled="slides.index.value === 0"
          aria-label="前のスライド"
          @click="slides.prev"
        >
          <AppIcon name="arrowLeft" :size="18" :stroke="2" />
        </button>
        <div class="flex flex-1 items-center gap-1.5">
          <button
            v-for="n in slides.count.value"
            :key="n"
            type="button"
            class="h-1.5 flex-1 rounded-full transition-all duration-300"
            :class="
              n - 1 === slides.index.value
                ? 'bg-signal'
                : n - 1 < slides.index.value
                  ? 'bg-white/45 hover:bg-white/70'
                  : 'bg-white/15 hover:bg-white/35'
            "
            :aria-label="`${n} 枚目へ`"
            :aria-current="n - 1 === slides.index.value ? 'step' : undefined"
            @click="slides.go(n - 1)"
          />
        </div>
        <span class="w-14 text-center font-display text-sm text-white/60"
          >{{ slides.index.value + 1 }} / {{ slides.count.value }}</span
        >
        <button
          v-if="!onLast"
          type="button"
          class="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-signal"
          @click="slides.next"
        >
          次へ
          <AppIcon name="arrowRight" :size="16" :stroke="2" />
        </button>
        <button
          v-else
          type="button"
          class="flex items-center gap-2 rounded-full bg-signal px-5 py-2.5 text-sm font-bold text-stage transition hover:brightness-110"
          @click="completeAndNext"
        >
          {{ done ? "次のレッスン" : "完了して次へ" }}
          <AppIcon name="arrowRight" :size="16" :stroke="2" />
        </button>
      </nav>
      <p class="mt-2 text-center text-xs text-ink/35">← → キーでも移動できます</p>
    </div>

    <footer v-if="!slideMode" class="mt-28 border-t border-line pt-10">
      <div class="flex flex-wrap items-center justify-between gap-6">
        <RouterLink
          v-if="nav.prev"
          :to="`/lessons/${nav.prev.id}`"
          class="flex items-center gap-2 text-sm text-ink/50 transition hover:text-ink"
        >
          <AppIcon name="arrowLeft" :size="16" :stroke="2" />
          {{ nav.prev.id }} {{ nav.prev.title }}
        </RouterLink>
        <span v-else />
        <div class="flex items-center gap-5">
          <button
            v-if="done"
            type="button"
            class="text-sm text-ink/40 underline underline-offset-4 hover:text-ink/70"
            @click="progress.setCompleted(lesson.id, false)"
          >
            未完了に戻す
          </button>
          <button
            type="button"
            class="flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-bold text-white transition hover:bg-brand-700"
            @click="completeAndNext"
          >
            {{ done ? "次へ" : "このレッスンを完了" }}
            <template v-if="nav.next">
              <AppIcon name="arrowRight" :size="16" :stroke="2" />
              <span class="font-display">{{ nav.next.id }}</span>
            </template>
          </button>
        </div>
      </div>
    </footer>
    <TerminalDock v-if="lesson.terminal" />
  </article>
</template>
