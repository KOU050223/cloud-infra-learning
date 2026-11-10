<script setup lang="ts">
import { RouterLink } from "vue-router";
import { allLessons } from "../data/course";
import AppIcon from "../components/icons/AppIcon.vue";
import { useProgressStore } from "../stores/progress";

const progress = useProgressStore();
const remaining = () => allLessons.filter((l) => !progress.isCompleted(l.id));
</script>

<template>
  <div class="mx-auto max-w-2xl px-10 py-24 text-center">
    <template v-if="progress.allDone">
      <div class="relative mx-auto size-36">
        <svg viewBox="0 0 140 140" class="absolute inset-0" aria-hidden="true">
          <circle
            cx="70"
            cy="70"
            r="52"
            fill="var(--color-signal)"
            opacity="0.25"
            class="pulse-ring"
          />
          <g class="spin-slow">
            <circle
              v-for="k in 8"
              :key="k"
              :cx="70 + 62 * Math.cos((k * Math.PI) / 4)"
              :cy="70 + 62 * Math.sin((k * Math.PI) / 4)"
              :r="k % 2 ? 4 : 2.5"
              :fill="k % 2 ? 'var(--color-signal)' : 'var(--color-brand-500)'"
            />
          </g>
          <circle cx="70" cy="70" r="46" fill="var(--color-stage)" />
          <AppIcon name="trophy" :x="46" :y="46" :size="48" :stroke="1.5" class="text-signal" />
        </svg>
      </div>
      <h1 class="mt-10 text-3xl font-bold">修了おめでとうございます！</h1>
      <p class="mt-8 text-[16px] leading-[2] text-ink/70">
        API を自分の手で公開し、build
        チェックに通ったときだけ自動でデプロイされる仕組みを作りました。
        ユーザーに届けるまでを支えるのがインフラの仕事です。成果が目に見えにくい分、
        身近なインフラ担当をぜひ労ってあげてください。
      </p>
      <div
        class="mt-14 rounded-3xl bg-white p-9 text-left text-[15px] shadow-[0_0_0_1px_var(--color-line)]"
      >
        <h2 class="font-bold text-slate-900">振り返り：説明できるようになったこと</h2>
        <ul class="mt-5 list-disc space-y-3 pl-5 leading-relaxed text-ink/75">
          <li>localhost と公開環境の違い、リクエストがAPIに届くまでの流れ</li>
          <li>Compute・DB・Storage・Network・認証の役割と、IaaS〜SaaS の違い</li>
          <li>今回 Cloudflare Workers を選んだ理由</li>
          <li>
            CI と CD の違い、チェックに失敗したらデプロイを止める理由と、build で止められない不具合
          </li>
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
