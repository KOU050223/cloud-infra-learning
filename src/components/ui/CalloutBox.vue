<script setup lang="ts">
import AppIcon from "../icons/AppIcon.vue";
import type { IconName } from "../icons/icons";

const { tone = "info", title } = defineProps<{ tone?: "info" | "warn" | "tip"; title?: string }>();
const styles = {
  info: {
    box: "bg-sky-50/70 shadow-[inset_4px_0_0_var(--color-sky-400)]",
    icon: "bg-sky-100 text-sky-700",
  },
  warn: {
    box: "bg-amber-50/80 shadow-[inset_4px_0_0_var(--color-amber-400)]",
    icon: "bg-amber-100 text-amber-700",
  },
  tip: {
    box: "bg-emerald-50/70 shadow-[inset_4px_0_0_var(--color-emerald-400)]",
    icon: "bg-emerald-100 text-emerald-700",
  },
} as const;
const icons: Record<"info" | "warn" | "tip", IconName> = {
  info: "bulb",
  warn: "alert",
  tip: "checkCircle",
};
</script>

<template>
  <aside
    class="not-prose relative my-12 rounded-2xl py-6 pr-7 pl-8 text-[15.5px] leading-[1.95] text-ink/85"
    :class="styles[tone].box"
  >
    <div v-if="title" class="mb-3 flex items-center gap-3 font-bold text-ink">
      <span class="flex size-8 items-center justify-center rounded-lg" :class="styles[tone].icon">
        <AppIcon :name="icons[tone]" :size="18" :stroke="1.9" />
      </span>
      {{ title }}
    </div>
    <div
      class="[&_code]:rounded-md [&_code]:bg-ink/[0.07] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.86em] [&_strong]:font-bold [&_strong]:text-ink"
    >
      <slot />
    </div>
  </aside>
</template>
