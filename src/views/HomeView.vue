<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { allLessons, findLesson, kindLabel, sessions } from "../data/course";
import { useProgressStore } from "../stores/progress";

const progress = useProgressStore();

const resume = computed(() => {
  const last = progress.lastLessonId ? findLesson(progress.lastLessonId) : undefined;
  return last ?? allLessons.find((l) => !progress.isCompleted(l.id)) ?? allLessons[0];
});

function confirmReset() {
  if (window.confirm("進捗とチェックをすべて消します。よろしいですか？")) progress.reset();
}
</script>

<template>
  <div class="mx-auto max-w-4xl px-10 py-12">
    <p class="text-sm font-semibold text-brand-600">90分 × 2回の講座 ＋ 自習用サイト</p>
    <h1 class="mt-2 text-3xl font-bold text-slate-900">
      クラウドの仕組みを見て、触って、<br />自分のAPIを公開しよう
    </h1>
    <p class="mt-4 max-w-2xl leading-relaxed text-slate-600">
      「ローカルでは動いた。でも公開の設定はよくわからない」「Vercel
      をぽちぽちしてデプロイしている」
      「リリースのたびにビクビクしている」——そんな人向けの講座です。図解とシミュレーターで仕組みをつかみ、
      最後は自分のPCで Hono API を Cloudflare Workers に公開し、CI/CD まで組み立てます。
    </p>

    <div class="mt-6 flex items-center gap-4">
      <RouterLink
        :to="`/lessons/${resume?.id}`"
        class="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-brand-700"
      >
        {{ progress.completedCount === 0 ? "はじめる" : "続きから" }}：{{ resume?.id }}
        {{ resume?.title }}
      </RouterLink>
      <button
        v-if="progress.completedCount > 0"
        type="button"
        class="text-sm text-slate-400 underline hover:text-slate-600"
        @click="confirmReset"
      >
        進捗をリセット
      </button>
    </div>

    <section class="mt-10 rounded-xl border border-slate-200 bg-white p-6">
      <h2 class="font-bold text-slate-900">この講座のゴール</h2>
      <ul class="mt-3 grid grid-cols-2 gap-3 text-sm">
        <li class="rounded-lg bg-slate-50 p-3">☁️ クラウドの役割を自分の言葉で説明できる</li>
        <li class="rounded-lg bg-slate-50 p-3">🚀 API を手動で公開できる</li>
        <li class="rounded-lg bg-slate-50 p-3">
          🛡️ テスト成功時だけ自動デプロイする CI/CD を作れる
        </li>
        <li class="rounded-lg bg-slate-50 p-3">🧭 今回の技術選定の理由を説明できる</li>
      </ul>
    </section>

    <section v-for="s in sessions" :key="s.id" class="mt-10">
      <h2 class="text-xl font-bold text-slate-900">{{ s.title }}</h2>
      <p class="mt-1 text-sm text-slate-500">成果物：{{ s.deliverable }}</p>
      <ol class="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        <li v-for="l in s.lessons" :key="l.id">
          <RouterLink
            :to="`/lessons/${l.id}`"
            class="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50"
          >
            <span class="w-6 font-mono text-sm text-slate-400">{{ l.id }}</span>
            <span class="flex-1">
              <span class="font-semibold text-slate-900">{{ l.title }}</span>
              <span class="block text-sm text-slate-500">{{ l.summary }}</span>
            </span>
            <span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">{{
              kindLabel[l.kind]
            }}</span>
            <span class="w-16 text-right text-xs text-slate-400">{{ l.time }}</span>
            <span
              class="w-12 text-right text-xs font-semibold"
              :class="progress.isCompleted(l.id) ? 'text-emerald-600' : 'text-slate-300'"
              >{{ progress.isCompleted(l.id) ? "完了" : "—" }}</span
            >
          </RouterLink>
        </li>
      </ol>
    </section>

    <section class="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm">
      <h2 class="font-bold text-amber-900">講座の前に準備しておくもの</h2>
      <ul class="mt-2 list-disc space-y-1 pl-5 text-amber-900">
        <li>GitHub アカウント</li>
        <li>Cloudflare アカウント（無料プランで十分）</li>
        <li>Git と Node.js（LTS 版）がインストールされたPC</li>
        <li>お好みのエディタ（VS Code など）</li>
      </ul>
    </section>
  </div>
</template>
