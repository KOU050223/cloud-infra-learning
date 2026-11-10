<script setup lang="ts">
import MangaPanel from "../components/ui/MangaPanel.vue";
import AppIcon from "../components/icons/AppIcon.vue";
import BrandIcon from "../components/icons/BrandIcon.vue";
import type { BrandName } from "../components/icons/brands";
import type { IconName } from "../components/icons/icons";
import CalloutBox from "../components/ui/CalloutBox.vue";

const topics: { icon: IconName; name: string; desc: string; brands: BrandName[] }[] = [
  {
    icon: "flask",
    brands: ["vitest"],
    name: "自動テスト",
    desc: "build では止められない「動作の不具合」を、期待する結果を書いたテストで止める。L10 の発展パートが入り口。",
  },
  {
    icon: "eye",
    brands: ["vercel", "cloudflare"],
    name: "Preview デプロイ",
    desc: "Pull Request ごとに確認用の URL を自動で発行し、マージ前に動作を見られる。Vercel や Workers の Preview URL など。",
  },
  {
    icon: "codeDoc",
    brands: ["terraform"],
    name: "IaC（Infrastructure as Code）",
    desc: "インフラの構成をコードで管理する。Terraform など。誰が作っても同じ環境になり、変更履歴も残る。",
  },
  {
    icon: "robot",
    brands: ["githubactions"],
    name: "自動レビュー",
    desc: "Lint・型チェック・AI レビューを CI に組み込み、レビューの負担を減らす。",
  },
  {
    icon: "chart",
    brands: ["sentry", "grafana"],
    name: "監視",
    desc: "エラー率・レスポンス時間を可視化し、異常があれば通知する。Sentry、Grafana など。",
  },
  {
    icon: "pulse",
    brands: [],
    name: "SRE",
    desc: "信頼性をエンジニアリングで高める考え方。SLO（目標とする信頼性）を決め、障害から学び、運用作業を自動化する。",
  },
];
</script>

<template>
  <MangaPanel id="m12" />

  <p>
    お疲れさまでした！
    最後に、この先の学びにつながる分野を紹介します。今日の講座は、どれも入り口に立ったところです。
  </p>

  <div class="not-prose my-12 grid gap-4 md:grid-cols-2">
    <div
      v-for="t in topics"
      :key="t.name"
      class="rounded-3xl bg-white p-7 shadow-[0_0_0_1px_var(--color-line)]"
    >
      <div class="flex items-center gap-3 text-[16px] font-bold">
        <span
          class="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"
        >
          <AppIcon :name="t.icon" :size="20" />
        </span>
        {{ t.name }}
        <span class="ml-auto flex gap-1.5">
          <span
            v-for="b in t.brands"
            :key="b"
            class="flex size-8 items-center justify-center rounded-lg bg-ink/[0.04]"
          >
            <BrandIcon :name="b" :size="16" />
          </span>
        </span>
      </div>
      <p class="mt-4 text-[15px] leading-[1.9] text-ink/65">{{ t.desc }}</p>
    </div>
  </div>

  <h2>おすすめの学び方</h2>
  <ul>
    <li>
      <BrandIcon name="youtube" :size="18" class="mr-1.5 inline align-[-0.2em]" />YouTube：<a
        href="https://www.youtube.com/@engineer_ryoma"
        target="_blank"
        rel="noopener noreferrer"
        >りょうま@インフラ攻略</a
      >、
      <a href="https://youtu.be/KWMFakwvSxE" target="_blank" rel="noopener noreferrer"
        >【最短】インフラエンジニア→SRE 完全ロードマップ</a
      >
    </li>
    <li>自分のアプリに DB（D1）を足して、マイグレーションまで CI/CD に入れてみる</li>
    <li>
      物理的な機材（ラズパイなど）でサーバーを立てると、クラウドが何を肩代わりしてくれているかが実感できる
    </li>
  </ul>

  <h2>この講座で持ち帰ってほしいこと</h2>
  <ol>
    <li><strong>デプロイ先から逆算して技術選定をする</strong></li>
    <li><strong>作って終わりではなく「サービスを提供し続ける」意識を持つ</strong></li>
    <li>
      <strong>インフラは成果が目に見えにくいけれど大事な仕事</strong
      >。支えてくれる人を労ってあげよう
    </li>
  </ol>

  <CalloutBox tone="tip" title="最後に">
    下のボタンでこのレッスンを完了すると、修了画面に進みます。
  </CalloutBox>
</template>
