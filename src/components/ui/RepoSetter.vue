<script setup lang="ts">
import { ref } from "vue";
import { normalizeRepo } from "../../lib/links";
import { useProgressStore } from "../../stores/progress";
import BrandIcon from "../icons/BrandIcon.vue";

/** 手順のリンク先に使う GitHub リポジトリを設定する */
const { compact = false } = defineProps<{ compact?: boolean }>();
const progress = useProgressStore();
const draft = ref(progress.githubRepo ?? "");
const editing = ref(!progress.githubRepo);
const error = ref(false);

function save() {
  const repo = normalizeRepo(draft.value);
  error.value = repo === null;
  if (!repo) return;
  progress.setGithubRepo(repo);
  draft.value = repo;
  editing.value = false;
}
</script>

<template>
  <div class="not-prose" :class="compact ? '' : 'my-8'">
    <div
      v-if="!editing && progress.githubRepo"
      class="flex flex-wrap items-center gap-3 rounded-2xl bg-ink/[0.04] px-5 py-3.5 text-[14px]"
    >
      <BrandIcon name="github" :size="18" />
      <span class="text-ink/55">リンク先のリポジトリ</span>
      <code class="font-mono font-bold">{{ progress.githubRepo }}</code>
      <button
        type="button"
        class="ml-auto text-sm text-brand-600 underline underline-offset-4"
        @click="editing = true"
      >
        変更
      </button>
    </div>
    <form
      v-else
      class="rounded-2xl border-2 border-dashed border-ink/15 bg-white px-5 py-4"
      @submit.prevent="save"
    >
      <label for="repo-input" class="flex items-center gap-2.5 text-[14px] font-bold">
        <BrandIcon name="github" :size="18" />
        あなたの GitHub リポジトリ
      </label>
      <p class="mt-1.5 text-[13px] leading-relaxed text-ink/55">
        入力すると、Settings や Actions タブへのリンクがあなたのリポジトリを直接開くようになります。
      </p>
      <div class="mt-3 flex gap-2">
        <input
          id="repo-input"
          v-model="draft"
          placeholder="taro/my-api または https://github.com/taro/my-api"
          spellcheck="false"
          autocomplete="off"
          class="min-w-0 flex-1 rounded-xl border border-line bg-paper px-4 py-2.5 font-mono text-[14px] outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
          :aria-invalid="error"
          @input="error = false"
        />
        <button
          type="submit"
          class="rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          設定
        </button>
      </div>
      <p v-if="error" class="mt-2 text-[13px] text-rose-600" role="alert">
        「owner/repo」の形か、GitHub のリポジトリ URL を入れてください。
      </p>
    </form>
  </div>
</template>
