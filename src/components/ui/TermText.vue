<script setup lang="ts">
import { computed } from "vue";
import { parseTermText } from "../../data/glossary";
import Term from "./Term.vue";

/** 「世界中の[[edge|エッジ]]で」のような文字列を、用語チップ入りで表示する */
const { text } = defineProps<{ text: string }>();
const parts = computed(() => parseTermText(text));
</script>

<template>
  <template v-for="(p, i) in parts" :key="i"
    ><Term v-if="'id' in p" :id="p.id">{{ p.text }}</Term
    ><template v-else>{{ p.text }}</template></template
  >
</template>
