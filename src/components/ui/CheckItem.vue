<script setup lang="ts">
import { computed } from "vue";
import { useProgressStore } from "../../stores/progress";

const { id, label } = defineProps<{ id: string; label: string }>();
const progress = useProgressStore();
const checked = computed({
  get: () => progress.isChecked(id),
  set: (v: boolean) => progress.setChecked(id, v),
});
</script>

<template>
  <label
    class="not-prose my-2.5 flex cursor-pointer items-center gap-4 rounded-2xl border-2 px-5 py-4 text-[15px] leading-relaxed transition"
    :class="
      checked ? 'border-emerald-400 bg-emerald-50/60' : 'border-line bg-white hover:border-ink/20'
    "
  >
    <input v-model="checked" type="checkbox" class="peer sr-only" />
    <span
      class="flex size-6 shrink-0 items-center justify-center rounded-lg border-2 transition peer-focus-visible:ring-4 peer-focus-visible:ring-brand-100"
      :class="checked ? 'border-emerald-500 bg-emerald-500' : 'border-ink/20 bg-white'"
    >
      <svg v-if="checked" viewBox="0 0 24 24" class="size-4" fill="none" aria-hidden="true">
        <path
          d="M5 12.5l4.5 4.5L19 7.5"
          stroke="white"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="draw-in"
          style="--len: 22"
        />
      </svg>
    </span>
    <span :class="checked ? 'text-emerald-900' : ''">{{ label }}</span>
  </label>
</template>
