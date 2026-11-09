<script setup lang="ts">
import { RouterLink } from "vue-router";
import { allLessons } from "../data/course";
import { useProgressStore } from "../stores/progress";

const progress = useProgressStore();
const remaining = () => allLessons.filter((l) => !progress.isCompleted(l.id));
</script>

<template>
  <div class="mx-auto max-w-2xl px-10 py-16 text-center">
    <template v-if="progress.allDone">
      <div class="text-5xl">🎉</div>
      <h1 class="mt-4 text-3xl font-bold text-slate-900">修了おめでとうございます！</h1>
      <p class="mt-4 leading-relaxed text-slate-600">
        API を自分の手で公開し、テストに通ったときだけ自動でデプロイされる仕組みを作りました。
        ユーザーに届けるまでを支えるのがインフラの仕事です。成果が目に見えにくい分、
        身近なインフラ担当をぜひ労ってあげてください。
      </p>
      <div class="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-left text-sm">
        <h2 class="font-bold text-slate-900">振り返り：説明できるようになったこと</h2>
        <ul class="mt-3 list-disc space-y-1.5 pl-5 text-slate-700">
          <li>localhost と公開環境の違い、リクエストがAPIに届くまでの流れ</li>
          <li>Compute・DB・Storage・Network・認証の役割と、IaaS〜SaaS の違い</li>
          <li>今回 Cloudflare Workers を選んだ理由</li>
          <li>CI と CD の違い、テストに失敗したらデプロイを止める理由</li>
        </ul>
      </div>
    </template>
    <template v-else>
      <h1 class="text-2xl font-bold text-slate-900">あと {{ remaining().length }} レッスン</h1>
      <ul class="mt-6 space-y-2">
        <li v-for="l in remaining()" :key="l.id">
          <RouterLink :to="`/lessons/${l.id}`" class="text-brand-600 underline"
            >{{ l.id }} {{ l.title }}</RouterLink
          >
        </li>
      </ul>
    </template>
    <RouterLink to="/" class="mt-10 inline-block text-sm text-slate-500 underline"
      >コース一覧へ</RouterLink
    >
  </div>
</template>
