<script setup lang="ts">
import { ref } from "vue";

const { code, lang, title } = defineProps<{ code: string; lang?: string; title?: string }>();
const copied = ref(false);

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
  <div class="my-4 overflow-hidden rounded-lg border border-slate-800 bg-slate-900 text-slate-100">
    <div
      class="flex items-center justify-between border-b border-slate-700 px-4 py-1.5 text-xs text-slate-400"
    >
      <span>{{ title ?? lang ?? "terminal" }}</span>
      <button type="button" class="rounded px-2 py-0.5 hover:bg-slate-700" @click="copy">
        {{ copied ? "コピーしました" : "コピー" }}
      </button>
    </div>
    <pre
      class="overflow-x-auto px-4 py-3 font-mono text-[13px] leading-relaxed"
    ><code>{{ code }}</code></pre>
  </div>
</template>
