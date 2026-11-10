<script setup lang="ts">
import { computed, ref } from "vue";
import { manga, speakers, type MangaId, type MangaPanelDef } from "../../data/manga";

/** 1コマ漫画。絵の上部に吹き出しを重ねる。絵がまだないときは台詞だけを表示する */
const { id } = defineProps<{ id: MangaId }>();
const panel = computed<MangaPanelDef>(() => manga[id]);
const broken = ref(false);
</script>

<template>
  <figure class="not-prose manga my-14 xl:-mx-10">
    <div
      class="relative overflow-hidden rounded-[22px] bg-white shadow-[0_0_0_3px_var(--color-ink),6px_6px_0_0_var(--color-ink)]"
    >
      <img
        v-if="!broken"
        :src="panel.src"
        :alt="panel.alt"
        class="block aspect-[3/2] w-full object-cover"
        loading="lazy"
        @error="broken = true"
      />
      <div
        v-else
        class="aspect-[3/2] w-full bg-[radial-gradient(circle_at_30%_20%,var(--color-brand-50),white_60%)]"
      />

      <!-- 吹き出し -->
      <div class="absolute inset-x-0 top-0 flex items-start justify-between gap-6 p-4 sm:p-6">
        <div
          v-for="(l, i) in panel.lines"
          :key="i"
          class="manga-bubble relative max-w-[46%] rounded-[20px] border-[2.5px] border-ink bg-white px-4 py-3 text-[14px] leading-[1.7] font-bold text-ink shadow-[3px_3px_0_0_var(--color-ink)] sm:text-[15.5px]"
          :class="[l.side === 'right' ? 'ml-auto' : '', i === 1 ? 'mt-10 sm:mt-14' : '']"
          :style="{ animationDelay: `${200 + i * 450}ms` }"
        >
          <span
            class="mb-1 flex items-center gap-1.5 text-[11px] font-bold tracking-wider"
            :class="l.who === 'kaniko' ? 'text-rose-500' : 'text-cyan-600'"
          >
            <img :src="speakers[l.who].avatar" alt="" class="size-5 rounded-full" />
            {{ speakers[l.who].name }}
          </span>
          {{ l.text }}
          <span
            class="absolute -bottom-[11px] size-5 rotate-45 border-r-[2.5px] border-b-[2.5px] border-ink bg-white"
            :class="l.side === 'right' ? 'right-8' : 'left-8'"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
    <figcaption class="sr-only">{{ panel.alt }}</figcaption>
  </figure>
</template>

<style scoped>
.manga-bubble {
  animation: pop 0.45s cubic-bezier(0.3, 1.5, 0.5, 1) both;
}
@keyframes pop {
  from {
    opacity: 0;
    transform: scale(0.85) translateY(6px);
  }
}
</style>
