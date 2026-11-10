<script setup lang="ts">
import TermText from "../components/ui/TermText.vue";
import AppIcon from "../components/icons/AppIcon.vue";
import { ref } from "vue";
import BrandIcon from "../components/icons/BrandIcon.vue";
import type { BrandName } from "../components/icons/brands";
import CalloutBox from "../components/ui/CalloutBox.vue";
import QuizCard from "../components/ui/QuizCard.vue";

const major = [
  {
    name: "AWS",
    brand: "aws" as BrandName,
    by: "Amazon",
    color: "bg-amber-100 text-amber-900",
    feature: "シェアNo.1。サービス数が最多で、大規模サービスや企業での採用が多い。",
    good: "求人が多く、学んだことが仕事に直結しやすい",
    care: "サービスが多すぎて迷いやすい。[[payg|従量課金]]で請求額が読みにくい",
  },
  {
    name: "Google Cloud",
    brand: "googlecloud" as BrandName,
    by: "Google",
    color: "bg-sky-100 text-sky-900",
    feature: "データ分析（BigQuery）や AI に強い。Firebase もこの仲間。",
    good: "Firebase で認証・DB・ホスティングをまとめて素早く作れる",
    care: "Firebase 以外のサービスは AWS 同様に学習コストが高め",
  },
  {
    name: "Azure",
    brand: "azure" as BrandName,
    by: "Microsoft",
    color: "bg-indigo-100 text-indigo-900",
    feature: "Microsoft 製品（Office・Entra ID）との連携が強く、企業の社内システムで多い。",
    good: "Windows・.NET・社内認証との相性が良い",
    care: "個人開発で選ばれることは少なめ",
  },
  {
    name: "Cloudflare",
    brand: "cloudflare" as BrandName,
    by: "Cloudflare",
    color: "bg-orange-100 text-orange-900",
    feature: "もともとは CDN・セキュリティの会社。世界中のエッジでコードを動かす Workers が中心。",
    good: "無料枠が広い。[[d1|D1]]（DB）・[[r2|R2]]（ストレージ）などもそろう",
    care: "Node.js の全機能が使えるわけではない（[[edge|エッジ]]向けの実行環境）",
  },
  {
    name: "Vercel",
    brand: "vercel" as BrandName,
    by: "Vercel",
    color: "bg-slate-200 text-slate-900",
    feature: "Next.js の開発元。GitHub と連携するだけでフロントエンドを公開できる。",
    good: "Preview（PRごとの確認用URL）など開発体験が非常に良い",
    care: "無料の Hobby プランは非商用利用のみ",
  },
];

const others = [
  {
    name: "GitHub Pages",
    brand: "githubpages" as BrandName,
    desc: "静的サイトを無料で公開。API は動かせない",
  },
  {
    name: "Render",
    brand: "render" as BrandName,
    desc: "PaaS。Web サーバーや DB を簡単に立てられる",
  },
  { name: "Heroku", brand: "heroku" as BrandName, desc: "PaaS の元祖。現在は無料プランなし" },
  {
    name: "Firebase",
    brand: "firebase" as BrandName,
    desc: "Google の BaaS。認証・Firestore・Hosting など",
  },
];

const dbs = [
  {
    name: "Cloudflare D1",
    brand: "cloudflare" as BrandName,
    engineBrand: "sqlite" as BrandName,
    engine: "SQLite",
    desc: "Workers からそのまま使える",
  },
  {
    name: "Supabase",
    brand: "supabase" as BrandName,
    engineBrand: "postgresql" as BrandName,
    engine: "PostgreSQL",
    desc: "認証・ストレージ付きの BaaS",
  },
  {
    name: "Neon",
    brand: "neon" as BrandName,
    engineBrand: "postgresql" as BrandName,
    engine: "PostgreSQL",
    desc: "サーバーレス Postgres。ブランチ機能がある",
  },
  {
    name: "TiDB Cloud",
    brand: "tidb" as BrandName,
    engineBrand: "mysql" as BrandName,
    engine: "MySQL 互換",
    desc: "分散 DB のサーバーレス版",
  },
];

const open = ref<string | null>("Cloudflare");
</script>

<template>
  <p>
    よく聞くクラウドサービスの特色を、広く浅く見ていきます。クリックすると詳細が開きます。
    「どれが一番いいか」ではなく「何をしたいときに向いているか」を意識しましょう。
  </p>

  <div class="not-prose my-12 space-y-3">
    <div
      v-for="s in major"
      :key="s.name"
      class="overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_var(--color-line)] transition"
    >
      <button
        type="button"
        class="flex w-full items-center gap-5 px-6 py-5 text-left transition hover:bg-ink/[0.02]"
        :aria-expanded="open === s.name"
        @click="open = open === s.name ? null : s.name"
      >
        <span class="flex w-44 shrink-0 items-center gap-3">
          <span
            class="flex size-11 items-center justify-center rounded-xl transition-transform duration-300"
            :class="[s.color, open === s.name ? 'scale-110 -rotate-6' : '']"
          >
            <BrandIcon :name="s.brand" :size="22" />
          </span>
          <span>
            <span class="block font-bold">{{ s.name }}</span>
            <span class="block text-xs text-ink/45">{{ s.by }}</span>
          </span>
        </span>
        <span class="flex-1 text-[15px] leading-relaxed text-ink/70">{{ s.feature }}</span>
        <AppIcon
          name="plus"
          :size="18"
          :stroke="2"
          class="text-ink/35 transition-transform duration-300"
          :class="open === s.name ? 'rotate-45' : ''"
        />
      </button>
      <div
        v-if="open === s.name"
        class="rise-in grid gap-6 border-t border-line px-6 py-6 text-[15px] leading-[1.9] md:grid-cols-2"
      >
        <div>
          <div class="text-xs font-bold text-emerald-700">得意なこと</div>
          <p class="mt-2"><TermText :text="s.good" /></p>
        </div>
        <div>
          <div class="text-xs font-bold text-amber-700">気をつけること</div>
          <p class="mt-2"><TermText :text="s.care" /></p>
        </div>
      </div>
    </div>
  </div>

  <h3>ほかにもよく見かけるもの</h3>
  <ul class="not-prose my-8 grid gap-3 md:grid-cols-2">
    <li
      v-for="o in others"
      :key="o.name"
      class="flex items-start gap-4 rounded-2xl bg-white px-5 py-5 shadow-[0_0_0_1px_var(--color-line)]"
    >
      <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink/[0.04]">
        <BrandIcon :name="o.brand" :size="20" />
      </span>
      <span>
        <span class="block font-bold">{{ o.name }}</span>
        <span class="mt-1 block text-[14px] leading-relaxed text-ink/60">{{ o.desc }}</span>
      </span>
    </li>
  </ul>

  <h3>無料枠があってよく使われる DB</h3>
  <table>
    <thead>
      <tr>
        <th>サービス</th>
        <th>中身</th>
        <th>特徴</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="d in dbs" :key="d.name">
        <td>
          <span class="flex items-center gap-3">
            <BrandIcon :name="d.brand" :size="20" />
            <strong>{{ d.name }}</strong>
          </span>
        </td>
        <td>
          <span class="flex items-center gap-2 whitespace-nowrap">
            <BrandIcon :name="d.engineBrand" :size="16" />
            {{ d.engine }}
          </span>
        </td>
        <td>{{ d.desc }}</td>
      </tr>
    </tbody>
  </table>

  <h2>なぜ今回は Cloudflare Workers？</h2>
  <div class="not-prose stage my-10 flex items-center justify-center gap-6 px-8 py-10 md:gap-10">
    <div class="float-y flex flex-col items-center gap-3">
      <span
        class="flex size-20 items-center justify-center rounded-3xl bg-white/[0.07] ring-1 ring-white/15"
      >
        <BrandIcon name="hono" :size="40" />
      </span>
      <span class="text-sm font-bold text-white">Hono</span>
    </div>
    <svg viewBox="0 0 120 24" class="w-20 md:w-28" aria-hidden="true">
      <path d="M4 12h112" stroke="oklch(1 0 0 / 0.15)" stroke-width="2" />
      <path d="M4 12h112" stroke="var(--color-signal)" stroke-width="2" class="wire-flow" />
    </svg>
    <div class="float-y flex flex-col items-center gap-3" style="animation-delay: -2s">
      <span
        class="relative flex size-20 items-center justify-center rounded-3xl bg-white/[0.07] ring-1 ring-signal/60"
      >
        <span class="pulse-ring absolute inset-0 rounded-3xl bg-signal/20" />
        <BrandIcon name="cloudflareworkers" :size="40" class="relative" />
      </span>
      <span class="text-sm font-bold text-white">Cloudflare Workers</span>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>観点</th>
        <th>理由</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Hono との相性</td>
        <td>
          Hono はもともと Workers 向けに生まれたフレームワーク。公式テンプレートがあり、そのまま動く
        </td>
      </tr>
      <tr>
        <td>運用の手間</td>
        <td>FaaS なので OS 更新やサーバー管理が不要。コードを置くだけ</td>
      </tr>
      <tr>
        <td>CLI</td>
        <td>Wrangler でローカル実行・公開・ログ確認まで完結。GitHub Actions からも使いやすい</td>
      </tr>
      <tr>
        <td>料金</td>
        <td>無料プランで1日10万リクエストまで。クレジットカード登録なしで始められる</td>
      </tr>
      <tr>
        <td>制約</td>
        <td>
          1リクエストあたりの CPU 時間に上限がある、Node.js の一部 API
          が使えない。重い処理や長時間の処理には向かない
        </td>
      </tr>
    </tbody>
  </table>

  <CalloutBox tone="info" title="デプロイ先から逆算する">
    たとえば「Express で作った API」をそのまま Workers に載せるのは難しく、Render などの PaaS
    の方が楽です。 逆に、最初から Workers に載せると決めていれば Hono を選ぶ理由になります。
    <strong>技術選定とデプロイ先はセットで考える</strong>のがポイントです。
  </CalloutBox>

  <QuizCard
    question="今回 Cloudflare Workers を選んだ理由として、適切でないものは？"
    :options="[
      {
        label: 'Hono が Workers 向けのテンプレートを用意している',
        explain: 'これは選定理由のひとつです。',
      },
      {
        label: 'サーバーの OS 管理をしなくてよい',
        explain: 'FaaS なので OS 管理は不要。これも選定理由です。',
      },
      {
        label: '1回のリクエストで何分もかかる重い処理が得意',
        correct: true,
        explain:
          'Workers は CPU 時間に上限があり、重い長時間処理は苦手です。そうした処理には別の Compute を選びます。',
      },
    ]"
  />
</template>
