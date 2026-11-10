<script setup lang="ts">
import { computed } from "vue";
import { repoUrl, type RepoPage } from "../../lib/links";
import { useProgressStore } from "../../stores/progress";
import AppIcon from "../icons/AppIcon.vue";
import BrandIcon from "../icons/BrandIcon.vue";
import type { BrandName } from "../icons/brands";
import RepoSetter from "./RepoSetter.vue";

/**
 * 「どの画面のどこを押すか」をパンくずで見せつつ、そのページを直接開けるリンク。
 * href か repoPage（自分の GitHub リポジトリのページ）のどちらかを渡す。
 */
const { href, repoPage, brand, path, note } = defineProps<{
  href?: string;
  repoPage?: RepoPage;
  brand?: BrandName;
  /** 画面上でたどる順番（例：["My Profile", "API Tokens", "Create Token"]） */
  path: string[];
  /** パンくずの下に添える補足 */
  note?: string;
}>();

const progress = useProgressStore();
const url = computed(() => {
  if (href) return href;
  if (repoPage && progress.githubRepo) return repoUrl(progress.githubRepo, repoPage);
  return null;
});
const needsRepo = computed(() => !!repoPage && !progress.githubRepo);
</script>

<template>
  <div class="not-prose my-6">
    <component
      :is="url ? 'a' : 'div'"
      :href="url ?? undefined"
      :target="url ? '_blank' : undefined"
      :rel="url ? 'noopener noreferrer' : undefined"
      class="group flex items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-[0_0_0_1px_var(--color-line)] transition"
      :class="
        url
          ? 'hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_var(--color-brand-300),0_12px_28px_-14px_oklch(0.42_0.18_268_/_0.45)]'
          : 'opacity-80'
      "
    >
      <span
        v-if="brand"
        class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-ink/[0.04]"
      >
        <BrandIcon :name="brand" :size="22" />
      </span>
      <span class="min-w-0 flex-1">
        <span class="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[14px] font-bold">
          <template v-for="(p, i) in path" :key="p">
            <AppIcon v-if="i > 0" name="chevronRight" :size="14" :stroke="2" class="text-ink/30" />
            <span
              class="rounded-md px-1.5 py-0.5"
              :class="i === path.length - 1 ? 'bg-brand-50 text-brand-700' : 'text-ink/80'"
              >{{ p }}</span
            >
          </template>
        </span>
        <span v-if="note || url" class="mt-1 block truncate text-[12.5px] text-ink/45">
          {{ note ?? url }}
        </span>
      </span>
      <span
        v-if="url"
        class="flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[13px] font-bold text-white transition group-hover:bg-brand-600"
      >
        開く
        <AppIcon name="external" :size="14" :stroke="2" />
      </span>
    </component>
    <RepoSetter v-if="needsRepo" compact class="mt-2" />
  </div>
</template>
