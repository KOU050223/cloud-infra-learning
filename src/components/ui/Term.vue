<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, useTemplateRef } from "vue";
import { RouterLink } from "vue-router";
import { findLesson } from "../../data/course";
import { glossary, type GlossaryId } from "../../data/glossary";

/** 用語チップ。クリックすると、その場に短い説明を出す */
const { id } = defineProps<{ id: GlossaryId }>();
const entry = computed(() => glossary[id]);
const lesson = computed(() => (entry.value.lesson ? findLesson(entry.value.lesson) : undefined));

const open = ref(false);
const alignRight = ref(false);
const root = useTemplateRef<HTMLSpanElement>("root");
const popId = useId();

function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) close();
}
function onKey(e: KeyboardEvent) {
  if (e.key === "Escape") close();
}
function close() {
  open.value = false;
  document.removeEventListener("click", onDocClick, true);
  document.removeEventListener("keydown", onKey);
}
async function toggle() {
  if (open.value) return close();
  const rect = root.value?.getBoundingClientRect();
  alignRight.value = !!rect && rect.left + 300 > window.innerWidth - 16;
  open.value = true;
  await nextTick();
  document.addEventListener("click", onDocClick, true);
  document.addEventListener("keydown", onKey);
}
onBeforeUnmount(close);
</script>

<template>
  <span ref="root" class="relative inline">
    <button
      type="button"
      class="cursor-help rounded-sm underline decoration-brand-300 decoration-dotted decoration-2 underline-offset-[5px] transition hover:bg-brand-50 hover:decoration-brand-500"
      :class="open ? 'bg-brand-50 decoration-brand-500' : ''"
      :aria-expanded="open"
      :aria-controls="popId"
      @click.stop="toggle"
    >
      <slot>{{ entry.term }}</slot>
    </button>
    <Transition name="swap">
      <span
        v-if="open"
        :id="popId"
        role="note"
        class="absolute top-full z-30 mt-2 block w-[min(18rem,calc(100vw-2rem))] rounded-2xl bg-ink p-4 text-left text-[13.5px] leading-[1.8] font-normal tracking-normal text-white/85 shadow-[0_18px_40px_-14px_oklch(0.2_0.05_265_/_0.6)]"
        :class="alignRight ? 'right-0' : 'left-0'"
      >
        <span class="block text-[14px] font-bold text-white">{{ entry.term }}</span>
        <span class="mt-1.5 block">{{ entry.desc }}</span>
        <span class="mt-3 flex items-center justify-between gap-3 text-[12px]">
          <RouterLink
            v-if="lesson"
            :to="`/lessons/${lesson.id}`"
            class="text-signal underline-offset-4 hover:underline"
            @click="close"
            >{{ lesson.id }} {{ lesson.title }}</RouterLink
          >
          <RouterLink
            to="/glossary"
            class="ml-auto text-white/50 underline-offset-4 hover:text-white hover:underline"
            @click="close"
            >用語集</RouterLink
          >
        </span>
      </span>
    </Transition>
  </span>
</template>
