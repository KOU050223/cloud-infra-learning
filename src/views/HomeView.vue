<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { allLessons, findLesson, kindLabel, sessions } from "../data/course";
import AppIcon from "../components/icons/AppIcon.vue";
import { links } from "../lib/links";
import BrandIcon from "../components/icons/BrandIcon.vue";
import type { BrandName } from "../components/icons/brands";
import type { IconName } from "../components/icons/icons";
import { useProgressStore } from "../stores/progress";

const progress = useProgressStore();

const resume = computed(() => {
  const last = progress.lastLessonId ? findLesson(progress.lastLessonId) : undefined;
  return last ?? allLessons.find((l) => !progress.isCompleted(l.id)) ?? allLessons[0];
});

/** いまの困りごと → 講座を終えたときの姿 → そのために学ぶこと */
const cast = [
  {
    name: "かに子",
    role: "主人公・1年生",
    desc: "部の HP の API 担当。作るのは得意だけど、公開や運用はこれから。",
    avatar: "/manga/avatar-kaniko.png",
    ring: "bg-rose-50",
  },
  {
    name: "リタ猫先輩",
    role: "先輩",
    desc: "インフラに詳しい頼れる先輩。語尾は「にゃ」。",
    avatar: "/manga/avatar-ritaneko.png",
    ring: "bg-cyan-50",
  },
];

const aims: {
  icon: IconName;
  now: string;
  goal: string;
  why: string;
  lessons: string[];
}[] = [
  {
    icon: "rocket",
    now: "ローカルでは動く。でも公開の設定がよくわからず、URL を人に渡せない",
    goal: "自分の API を自分の手で公開し、リクエストが届くまでの流れを説明できる",
    why: "流れを知っていれば、つながらないときにどこで止まっているのか見当をつけられます。",
    lessons: ["01", "02", "05"],
  },
  {
    icon: "compass",
    now: "Vercel のボタンで公開はできる。でも、なぜそのサービスなのかは説明できない",
    goal: "作りたいものから必要な機能を考え、デプロイ先の特徴から逆算して技術を選べる",
    why: "選んだ理由を説明できれば、別のサービスを使う場面でも同じ考え方で選び直せます。",
    lessons: ["03", "04"],
  },
  {
    icon: "shield",
    now: "リリースのたびに、どこかを壊していないか不安になる",
    goal: "壊れた変更が公開前に自動で止まる仕組みを作り、安心して何度でも更新できる",
    why: "人が毎回気をつけるより、確認を仕組みに任せたほうが、うっかりを確実に止められます。",
    lessons: ["07", "08", "10", "11"],
  },
];

const stack: { brand: BrandName; name: string; role: string }[] = [
  { brand: "hono", name: "Hono", role: "API" },
  { brand: "cloudflareworkers", name: "Workers", role: "公開先" },
  { brand: "github", name: "GitHub", role: "コード管理" },
  { brand: "githubactions", name: "Actions", role: "CI/CD" },
  { brand: "typescript", name: "TypeScript", role: "型チェック" },
];

const prep: { brands: BrandName[]; text: string; href: string }[] = [
  { brands: ["github"], text: "GitHub アカウント", href: links.ghSignUp },
  {
    brands: ["cloudflare"],
    text: "Cloudflare アカウント（無料プランで十分）",
    href: links.cfSignUp,
  },
  {
    brands: ["git", "nodedotjs"],
    text: "Git と Node.js（LTS 版）がインストールされたPC",
    href: links.nodeDownload,
  },
  { brands: [], text: "お好みのエディタ（VS Code など）", href: links.vscode },
];

function confirmReset() {
  if (window.confirm("進捗とチェックをすべて消します。よろしいですか？")) progress.reset();
}
</script>

<template>
  <div class="mx-auto max-w-[60rem] px-10 pt-20 pb-28">
    <!-- ヒーロー -->
    <section class="stage grid items-center gap-6 px-12 pt-14 pb-12 lg:grid-cols-[1fr_300px]">
      <div>
        <p class="relative text-sm font-bold tracking-wide text-signal">
          90分 × 2回の講座 ＋ 自習用サイト
        </p>
        <h1 class="relative mt-5 text-[2.5rem] leading-[1.45] font-bold text-white">
          クラウドの仕組みを<br />見て、触って、<br />自分の API を公開しよう
        </h1>
        <p class="relative mt-7 max-w-[30rem] text-[15.5px] leading-[2] text-white/70">
          作ったものを人に届けるまでの仕組みを、図解とシミュレーターでつかみます。最後は自分の Hono
          API を Cloudflare Workers に公開し、壊れた変更を自動で止める CI/CD まで組み立てます。
        </p>

        <div class="relative mt-10 flex flex-wrap items-center gap-5">
          <RouterLink
            :to="`/lessons/${resume?.id}`"
            class="flex items-center gap-3 rounded-full bg-signal px-7 py-3.5 font-bold text-stage transition hover:brightness-110"
          >
            {{ progress.completedCount === 0 ? "はじめる" : "続きから" }}
            <span class="font-display">{{ resume?.id }}</span>
            {{ resume?.title }}
            <AppIcon name="arrowRight" :size="18" :stroke="2" />
          </RouterLink>
          <button
            v-if="progress.completedCount > 0"
            type="button"
            class="text-sm text-white/45 underline underline-offset-4 hover:text-white/80"
            @click="confirmReset"
          >
            進捗をリセット
          </button>
        </div>

        <div class="relative mt-12 border-t border-white/10 pt-8">
          <div class="text-xs font-bold tracking-[0.18em] text-white/40">この講座で使うもの</div>
          <ul class="mt-5 flex flex-wrap gap-3">
            <li
              v-for="(t, i) in stack"
              :key="t.brand"
              class="rise-in flex items-center gap-3 rounded-2xl bg-white/[0.06] py-2.5 pr-4 pl-2.5 ring-1 ring-white/10"
              :style="{ animationDelay: `${300 + i * 90}ms` }"
            >
              <span class="flex size-9 items-center justify-center rounded-xl bg-white">
                <BrandIcon :name="t.brand" :size="20" />
              </span>
              <span class="leading-tight">
                <span class="block text-sm font-bold text-white">{{ t.name }}</span>
                <span class="block text-[11px] text-white/45">{{ t.role }}</span>
              </span>
            </li>
          </ul>
        </div>
      </div>
      <svg
        viewBox="0 0 420 220"
        class="pointer-events-none order-last hidden w-full lg:block"
        aria-hidden="true"
      >
        <path
          id="hero-a"
          d="M50 160 C 120 160, 150 70, 210 70"
          fill="none"
          stroke="oklch(1 0 0 / 0.15)"
          stroke-width="2"
        />
        <path
          id="hero-b"
          d="M210 70 C 270 70, 300 160, 370 160"
          fill="none"
          stroke="oklch(1 0 0 / 0.15)"
          stroke-width="2"
        />
        <path
          d="M50 160 C 120 160, 150 70, 210 70"
          fill="none"
          stroke="var(--color-signal)"
          stroke-width="2"
          class="wire-flow"
        />
        <path
          d="M210 70 C 270 70, 300 160, 370 160"
          fill="none"
          stroke="var(--color-ok)"
          stroke-width="2"
          class="wire-flow"
        />
        <circle v-for="k in 3" :key="`a${k}`" r="4" fill="var(--color-signal)">
          <animateMotion dur="2.4s" repeatCount="indefinite" :begin="`-${(k - 1) * 0.8}s`">
            <mpath href="#hero-a" />
          </animateMotion>
        </circle>
        <circle v-for="k in 3" :key="`b${k}`" r="4" fill="var(--color-ok)">
          <animateMotion dur="2.4s" repeatCount="indefinite" :begin="`-${(k - 1) * 0.8 + 0.4}s`">
            <mpath href="#hero-b" />
          </animateMotion>
        </circle>
        <g transform="translate(50 160)">
          <circle
            r="30"
            fill="oklch(0.28 0.04 265)"
            stroke="oklch(1 0 0 / 0.15)"
            stroke-width="2"
          />
          <AppIcon name="laptop" :x="-14" :y="-14" :size="28" :stroke="1.5" class="text-white/80" />
        </g>
        <g transform="translate(210 70)">
          <g class="float-y">
            <circle r="46" fill="var(--color-signal)" opacity="0.25" class="pulse-ring" />
            <circle
              r="40"
              fill="oklch(0.28 0.04 265)"
              stroke="var(--color-signal)"
              stroke-width="2"
            />
            <AppIcon name="cloud" :x="-20" :y="-20" :size="40" :stroke="1.5" class="text-signal" />
          </g>
        </g>
        <g transform="translate(370 160)">
          <circle
            r="30"
            fill="oklch(0.28 0.04 265)"
            stroke="oklch(1 0 0 / 0.15)"
            stroke-width="2"
          />
          <AppIcon name="globe" :x="-14" :y="-14" :size="28" :stroke="1.5" class="text-white/80" />
        </g>
      </svg>
    </section>

    <!-- 物語 -->
    <section class="mt-24">
      <div class="font-display text-xs font-bold tracking-[0.2em] text-brand-600">STORY</div>
      <h2 class="mt-3 text-2xl font-bold">情報技術研究部の HP を公開せよ</h2>
      <p class="mt-6 max-w-[42rem] text-[16px] leading-[2] text-ink/75">
        主人公は、情報技術研究部の1年生・かに子。部の HP を作り直すことになり、画面は完成しました。
        かに子の担当は、HP にお知らせやあいさつを返す API です。ところがこの API は、まだかに子の PC
        の中でしか動いていません。講座では、リタ猫先輩に教わりながら、かに子と一緒にこの API
        を世界に公開し、部員みんなで安全に更新できるようにしていきます。
      </p>
      <ul class="mt-10 grid gap-4 sm:grid-cols-2">
        <li
          v-for="c in cast"
          :key="c.name"
          class="flex items-center gap-5 rounded-3xl bg-white p-5 shadow-[0_0_0_1px_var(--color-line)]"
        >
          <img :src="c.avatar" :alt="c.name" class="size-20 shrink-0 rounded-2xl" :class="c.ring" />
          <span>
            <span class="block text-[11px] font-bold tracking-[0.15em] text-ink/40">{{
              c.role
            }}</span>
            <span class="mt-0.5 block text-[17px] font-bold">{{ c.name }}</span>
            <span class="mt-1.5 block text-[13.5px] leading-relaxed text-ink/60">{{ c.desc }}</span>
          </span>
        </li>
      </ul>
      <ol class="mt-6 grid gap-4 md:grid-cols-2">
        <li
          v-for="(s, i) in sessions"
          :key="s.id"
          class="rise-in relative overflow-hidden rounded-3xl bg-stage p-7 text-white"
          :style="{ animationDelay: `${i * 140}ms` }"
        >
          <div class="font-display text-xs font-bold tracking-[0.2em] text-signal">
            CHAPTER {{ s.id }}
          </div>
          <div class="mt-3 text-[18px] leading-snug font-bold">{{ s.chapter.title }}</div>
          <p class="mt-4 text-[14.5px] leading-[1.9] text-white/70">{{ s.chapter.scene }}</p>
          <div class="mt-5 flex items-center gap-2 text-[13px] text-white/50">
            <AppIcon name="target" :size="15" :stroke="2" class="text-signal" />
            {{ s.deliverable }}
          </div>
        </li>
      </ol>
    </section>

    <!-- 目指す姿 -->
    <section class="mt-24">
      <div class="font-display text-xs font-bold tracking-[0.2em] text-brand-600">WHY</div>
      <h2 class="mt-3 text-2xl font-bold">この講座が目指す姿</h2>
      <p class="mt-6 max-w-[42rem] text-[16px] leading-[2] text-ink/75">
        アプリを作れるようになった人が次につまずくのは、作ったものを人に届ける場面です。
        この講座では、つまずきやすい3つの場面ごとに「講座を終えたときにどうなっていてほしいか」を決め、
        そこから逆算して学ぶことを選びました。
      </p>

      <ol class="mt-12 space-y-5">
        <li
          v-for="(a, i) in aims"
          :key="a.goal"
          class="rise-in rounded-3xl bg-white p-8 shadow-[0_0_0_1px_var(--color-line)]"
          :style="{ animationDelay: `${i * 120}ms` }"
        >
          <div class="grid items-center gap-5 md:grid-cols-[1fr_56px_1.15fr]">
            <!-- いま -->
            <div>
              <div class="text-xs font-bold tracking-wider text-ink/40">いま</div>
              <p class="mt-2 text-[15px] leading-[1.9] text-ink/60">{{ a.now }}</p>
            </div>
            <!-- 矢印 -->
            <svg viewBox="0 0 56 24" class="hidden w-14 md:block" aria-hidden="true">
              <path d="M2 12h46" stroke="var(--color-line)" stroke-width="2" />
              <path
                d="M2 12h46"
                stroke="var(--color-brand-500)"
                stroke-width="2"
                class="wire-flow"
              />
              <path
                d="M44 6l7 6-7 6"
                fill="none"
                stroke="var(--color-brand-500)"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <!-- 目指す姿 -->
            <div class="flex items-start gap-4 rounded-2xl bg-brand-50/70 px-5 py-4">
              <span
                class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600"
              >
                <AppIcon :name="a.icon" :size="20" />
              </span>
              <div>
                <div class="text-xs font-bold tracking-wider text-brand-600">目指す姿</div>
                <p class="mt-1.5 text-[15.5px] leading-[1.85] font-bold">{{ a.goal }}</p>
              </div>
            </div>
          </div>

          <div
            class="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-line pt-5 text-[14px]"
          >
            <span class="text-ink/60">{{ a.why }}</span>
            <span class="flex flex-wrap gap-2 md:ml-auto">
              <RouterLink
                v-for="id in a.lessons"
                :key="id"
                :to="`/lessons/${id}`"
                class="flex items-center gap-1.5 rounded-full bg-ink/[0.04] px-3 py-1 text-[13px] text-ink/70 transition hover:bg-ink hover:text-white"
              >
                <span class="font-display font-bold">{{ id }}</span>
                {{ findLesson(id)?.title }}
              </RouterLink>
            </span>
          </div>
        </li>
      </ol>

      <p class="mt-10 max-w-[42rem] text-[16px] leading-[2] text-ink/75">
        3つに共通するのは、作って終わりにせず、使う人に届け続けるという考え方です。公開した瞬間から、動かし続ける責任や料金への注意が始まります（06）。
        インフラの仕事は成果が目に見えにくいものの、こうした「届け続ける」を支えています。
      </p>
    </section>

    <!-- レッスン一覧 -->
    <section v-for="s in sessions" :key="s.id" class="mt-24">
      <div class="font-display text-xs font-bold tracking-[0.2em] text-brand-600">
        SESSION {{ s.id }}
      </div>
      <h2 class="mt-3 text-2xl font-bold">{{ s.title }}</h2>
      <p class="mt-2 text-[15px] font-bold text-brand-600">第{{ s.id }}章 {{ s.chapter.title }}</p>
      <p class="mt-3 text-[15px] text-ink/55">成果物：{{ s.deliverable }}</p>
      <ol class="mt-8 space-y-3">
        <li v-for="l in s.lessons" :key="l.id">
          <RouterLink
            :to="`/lessons/${l.id}`"
            class="group flex items-center gap-6 rounded-2xl bg-white px-7 py-5 shadow-[0_0_0_1px_var(--color-line)] transition hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_var(--color-line),0_12px_30px_-14px_oklch(0.2_0.03_265_/_0.35)]"
          >
            <span
              class="w-10 font-display text-2xl font-bold text-ink/20 transition group-hover:text-brand-500"
              >{{ l.id }}</span
            >
            <span class="flex-1">
              <span class="block text-[16px] font-bold">{{ l.title }}</span>
              <span class="mt-1.5 block text-sm leading-relaxed text-ink/55">{{ l.summary }}</span>
            </span>
            <span
              class="hidden rounded-full bg-ink/[0.05] px-3 py-1 text-xs text-ink/60 md:block"
              >{{ kindLabel[l.kind] }}</span
            >
            <span class="hidden w-16 text-right text-xs text-ink/40 md:block">{{ l.time }}</span>
            <span
              class="flex size-7 items-center justify-center rounded-full transition"
              :class="
                progress.isCompleted(l.id)
                  ? 'bg-emerald-500 text-white'
                  : 'bg-ink/[0.05] text-ink/25'
              "
              :aria-label="progress.isCompleted(l.id) ? '完了' : '未完了'"
            >
              <AppIcon
                :name="progress.isCompleted(l.id) ? 'check' : 'arrowRight'"
                :size="14"
                :stroke="2.4"
              />
            </span>
          </RouterLink>
        </li>
      </ol>
    </section>

    <!-- 準備 -->
    <section class="mt-24 rounded-3xl bg-amber-50/80 px-10 py-9">
      <h2 class="flex items-center gap-3 text-lg font-bold text-amber-950">
        <AppIcon name="terminal" :size="22" class="text-amber-700" />講座の前に準備しておくもの
      </h2>
      <ul class="mt-6 grid gap-3 md:grid-cols-2">
        <li v-for="p in prep" :key="p.text">
          <a
            :href="p.href"
            target="_blank"
            rel="noopener noreferrer"
            class="group flex h-full items-center gap-4 rounded-2xl bg-white/70 px-5 py-4 text-[15px] text-amber-950 transition hover:bg-white hover:shadow-[0_0_0_1px_var(--color-line)]"
          >
            <span class="flex -space-x-1.5">
              <span
                v-for="b in p.brands"
                :key="b"
                class="flex size-9 items-center justify-center rounded-xl bg-white shadow-[0_0_0_1px_var(--color-line)]"
              >
                <BrandIcon :name="b" :size="18" />
              </span>
              <span
                v-if="!p.brands.length"
                class="flex size-9 items-center justify-center rounded-xl bg-white text-amber-700 shadow-[0_0_0_1px_var(--color-line)]"
              >
                <AppIcon name="codeDoc" :size="18" />
              </span>
            </span>
            <span class="flex-1">{{ p.text }}</span>
            <AppIcon
              name="external"
              :size="16"
              :stroke="2"
              class="text-amber-700/50 transition group-hover:text-amber-700"
            />
          </a>
        </li>
      </ul>
    </section>
  </div>
</template>
