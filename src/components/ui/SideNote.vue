<script setup lang="ts">
import { ref, useId } from "vue";

/**
 * 本文の横に置く補足。
 * 広い画面では右の余白に常に表示し、狭い画面ではマークを押すと本文の下に開く。
 * tone="warn" は「ここで詰まりやすい」という注意に使う。
 */
const { tone = "info", title } = defineProps<{ tone?: "info" | "warn"; title?: string }>();
const open = ref(false);
const noteId = useId();
</script>

<template>
  <span class="sidenote-anchor">
    <button
      type="button"
      class="sidenote-mark"
      :class="[tone === 'warn' ? 'is-warn' : 'is-info', open ? 'is-open' : '']"
      :aria-expanded="open"
      :aria-controls="noteId"
      :aria-label="tone === 'warn' ? '注意を表示' : '補足を表示'"
      @click="open = !open"
    >
      {{ tone === "warn" ? "!" : "i" }}
    </button>
    <span
      :id="noteId"
      class="sidenote"
      :class="[tone === 'warn' ? 'is-warn' : 'is-info', open ? 'is-open' : '']"
      role="note"
    >
      <span v-if="title" class="sidenote-title">{{ title }}</span>
      <slot />
    </span>
  </span>
</template>
