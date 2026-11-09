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
    class="my-1.5 flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-2.5 text-sm transition"
    :class="checked ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'"
  >
    <input v-model="checked" type="checkbox" class="mt-0.5 size-4 accent-emerald-600" />
    <span :class="checked ? 'text-emerald-900' : ''">{{ label }}</span>
  </label>
</template>
