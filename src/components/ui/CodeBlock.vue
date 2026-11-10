<script setup lang="ts">
import { computed, ref } from "vue";
import { detectCodeBrand } from "../../lib/codeBrand";
import { isRunnable } from "../../lib/shell";
import { useTerminalStore } from "../../stores/terminal";
import AppIcon from "../icons/AppIcon.vue";
import BrandIcon from "../icons/BrandIcon.vue";

const { code, lang, title } = defineProps<{ code: string; lang?: string; title?: string }>();
const copied = ref(false);
const brand = computed(() => detectCodeBrand(code, title));
const term = useTerminalStore();
const runnable = computed(() => term.available && isRunnable(code));

async function copy() {
  try {
    await navigator.clipboard.writeText(code);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1500);
  } catch {
    // クリップボードが使えない環境では手でコピーしてもらう
  }
}
</script>

<template>
  <div
    class="not-prose my-7 overflow-hidden rounded-2xl bg-stage text-white/90 shadow-[0_10px_30px_-12px_oklch(0.2_0.03_265_/_0.5)]"
  >
    <div
      class="flex items-center justify-between border-b border-white/10 px-5 py-2.5 text-xs text-white/45"
    >
      <span class="flex items-center gap-3">
        <span class="flex gap-1.5"
          ><span class="size-2.5 rounded-full bg-white/15" /><span
            class="size-2.5 rounded-full bg-white/15" /><span
            class="size-2.5 rounded-full bg-white/15"
        /></span>
        <BrandIcon v-if="brand" :name="brand" :size="14" variant="light" />
        <span class="font-mono">{{ title ?? lang ?? "terminal" }}</span>
      </span>
      <span class="flex items-center gap-1">
        <button
          v-if="runnable"
          type="button"
          class="flex items-center gap-1.5 rounded-md bg-signal/15 px-2.5 py-1 font-bold text-signal transition hover:bg-signal hover:text-stage"
          @click="term.send(code)"
        >
          <AppIcon name="play" :size="12" :stroke="2.2" />
          試す
        </button>
        <button
          type="button"
          class="rounded-md px-2.5 py-1 transition hover:bg-white/10 hover:text-white"
          @click="copy"
        >
          {{ copied ? "コピーしました" : "コピー" }}
        </button>
      </span>
    </div>
    <pre
      class="overflow-x-auto px-5 py-4 font-mono text-[13.5px] leading-[1.8]"
    ><code>{{ code }}</code></pre>
  </div>
</template>
