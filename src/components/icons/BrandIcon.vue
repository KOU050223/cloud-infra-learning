<script setup lang="ts">
import { computed } from "vue";
import { brands, type BrandDef, type BrandName } from "./brands";

/**
 * サービスのロゴ。
 * variant="color" はブランドカラー（黒に近い色は暗い背景で見えないので light で白にする）、
 * "current" は親の文字色に合わせる。
 */
const {
  name,
  size = 20,
  variant = "color",
  x,
  y,
} = defineProps<{
  name: BrandName;
  size?: number | string;
  variant?: "color" | "light" | "current";
  x?: number;
  y?: number;
}>();

const def = computed<BrandDef>(() => brands[name]);

/** ブランドカラーが暗すぎるか（暗い背景用の判定） */
const isDark = computed(() => {
  const hex = def.value.hex.slice(1);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b! < 0.18;
});

const fill = computed(() => {
  if (variant === "current") return "currentColor";
  if (variant === "light" && isDark.value) return "#ffffff";
  return def.value.hex;
});
</script>

<template>
  <svg
    :width="size"
    :height="size"
    :x="x"
    :y="y"
    viewBox="0 0 24 24"
    role="img"
    :aria-label="def.title"
    class="shrink-0"
  >
    <title>{{ def.title }}</title>
    <path v-if="def.path" :d="def.path" :fill="fill" />
    <template v-else>
      <rect
        width="24"
        height="24"
        rx="6"
        :fill="variant === 'current' ? 'currentColor' : def.hex"
      />
      <text
        x="12"
        y="12.5"
        text-anchor="middle"
        dominant-baseline="middle"
        :font-size="(def.mono ?? '').length > 2 ? 8 : 11"
        font-weight="700"
        font-family="var(--font-display)"
        fill="#ffffff"
      >
        {{ def.mono }}
      </text>
    </template>
  </svg>
</template>
