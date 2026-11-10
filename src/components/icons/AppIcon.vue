<script setup lang="ts">
import { computed } from "vue";
import { icons, type IconDef, type IconName } from "./icons";

/**
 * 自作アイコン。色は currentColor を使うので、親の text-* で変えられる。
 * SVG の中に置くときは x / y / size を指定する。
 */
const {
  name,
  size = 24,
  stroke = 1.75,
  x,
  y,
} = defineProps<{
  name: IconName;
  size?: number | string;
  stroke?: number;
  x?: number;
  y?: number;
}>();

const def = computed<IconDef>(() => icons[name]);
</script>

<template>
  <svg
    :width="size"
    :height="size"
    :x="x"
    :y="y"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    class="shrink-0"
  >
    <path v-for="d in def.fill ?? []" :key="`f${d}`" :d="d" fill="currentColor" opacity="0.18" />
    <path
      v-for="d in def.stroke"
      :key="`s${d}`"
      :d="d"
      stroke="currentColor"
      :stroke-width="stroke"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path v-for="d in def.solid ?? []" :key="`d${d}`" :d="d" fill="currentColor" />
  </svg>
</template>
