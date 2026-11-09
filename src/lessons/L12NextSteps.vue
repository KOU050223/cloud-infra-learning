<script setup lang="ts">
import CalloutBox from "../components/ui/CalloutBox.vue";

const topics = [
  {
    icon: "👀",
    name: "Preview デプロイ",
    desc: "Pull Request ごとに確認用の URL を自動で発行し、マージ前に動作を見られる。Vercel や Workers の Preview URL など。",
  },
  {
    icon: "📝",
    name: "IaC（Infrastructure as Code）",
    desc: "インフラの構成をコードで管理する。Terraform など。誰が作っても同じ環境になり、変更履歴も残る。",
  },
  {
    icon: "🤖",
    name: "自動レビュー",
    desc: "Lint・型チェック・AI レビューを CI に組み込み、レビューの負担を減らす。",
  },
  {
    icon: "📈",
    name: "監視",
    desc: "エラー率・レスポンス時間を可視化し、異常があれば通知する。Sentry、Grafana など。",
  },
  {
    icon: "🛠️",
    name: "SRE",
    desc: "信頼性をエンジニアリングで高める考え方。SLO（目標とする信頼性）を決め、障害から学び、運用作業を自動化する。",
  },
];
</script>

<template>
  <p>
    お疲れさまでした！
    最後に、この先の学びにつながる分野を紹介します。今日の講座は、どれも入り口に立ったところです。
  </p>

  <div class="not-prose my-6 grid grid-cols-2 gap-3">
    <div v-for="t in topics" :key="t.name" class="rounded-xl border border-slate-200 bg-white p-4">
      <div class="font-bold text-slate-900">{{ t.icon }} {{ t.name }}</div>
      <p class="mt-1 text-sm text-slate-600">{{ t.desc }}</p>
    </div>
  </div>

  <h2>おすすめの学び方</h2>
  <ul>
    <li>
      YouTube：<a
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
