<script setup lang="ts">
import { ref } from "vue";
import CalloutBox from "../components/ui/CalloutBox.vue";
import QuizCard from "../components/ui/QuizCard.vue";

const major = [
  {
    name: "AWS",
    by: "Amazon",
    color: "bg-amber-100 text-amber-900",
    feature: "シェアNo.1。サービス数が最多で、大規模サービスや企業での採用が多い。",
    good: "求人が多く、学んだことが仕事に直結しやすい",
    care: "サービスが多すぎて迷いやすい。従量課金で請求額が読みにくい",
  },
  {
    name: "Google Cloud",
    by: "Google",
    color: "bg-sky-100 text-sky-900",
    feature: "データ分析（BigQuery）や AI に強い。Firebase もこの仲間。",
    good: "Firebase で認証・DB・ホスティングをまとめて素早く作れる",
    care: "Firebase 以外のサービスは AWS 同様に学習コストが高め",
  },
  {
    name: "Azure",
    by: "Microsoft",
    color: "bg-indigo-100 text-indigo-900",
    feature: "Microsoft 製品（Office・Entra ID）との連携が強く、企業の社内システムで多い。",
    good: "Windows・.NET・社内認証との相性が良い",
    care: "個人開発で選ばれることは少なめ",
  },
  {
    name: "Cloudflare",
    by: "Cloudflare",
    color: "bg-orange-100 text-orange-900",
    feature: "もともとは CDN・セキュリティの会社。世界中のエッジでコードを動かす Workers が中心。",
    good: "無料枠が広い。D1（DB）・R2（ストレージ）などもそろう",
    care: "Node.js の全機能が使えるわけではない（エッジ向けの実行環境）",
  },
  {
    name: "Vercel",
    by: "Vercel",
    color: "bg-slate-200 text-slate-900",
    feature: "Next.js の開発元。GitHub と連携するだけでフロントエンドを公開できる。",
    good: "Preview（PRごとの確認用URL）など開発体験が非常に良い",
    care: "無料の Hobby プランは非商用利用のみ",
  },
];

const others = [
  { name: "GitHub Pages", desc: "静的サイトを無料で公開。API は動かせない" },
  { name: "Render", desc: "PaaS。Web サーバーや DB を簡単に立てられる" },
  { name: "Heroku", desc: "PaaS の元祖。現在は無料プランなし" },
  { name: "Firebase", desc: "Google の BaaS。認証・Firestore・Hosting など" },
];

const dbs = [
  { name: "Cloudflare D1", engine: "SQLite", desc: "Workers からそのまま使える" },
  { name: "Supabase", engine: "PostgreSQL", desc: "認証・ストレージ付きの BaaS" },
  { name: "Neon", engine: "PostgreSQL", desc: "サーバーレス Postgres。ブランチ機能がある" },
  { name: "TiDB Cloud", engine: "MySQL 互換", desc: "分散 DB のサーバーレス版" },
];

const open = ref<string | null>("Cloudflare");
</script>

<template>
  <p>
    よく聞くクラウドサービスの特色を、広く浅く見ていきます。クリックすると詳細が開きます。
    「どれが一番いいか」ではなく「何をしたいときに向いているか」を意識しましょう。
  </p>

  <div class="not-prose my-6 space-y-2">
    <div
      v-for="s in major"
      :key="s.name"
      class="overflow-hidden rounded-xl border border-slate-200 bg-white"
    >
      <button
        type="button"
        class="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-slate-50"
        :aria-expanded="open === s.name"
        @click="open = open === s.name ? null : s.name"
      >
        <span class="rounded-md px-2.5 py-1 text-sm font-bold" :class="s.color">{{ s.name }}</span>
        <span class="flex-1 text-sm text-slate-600">{{ s.feature }}</span>
        <span class="text-slate-400">{{ open === s.name ? "−" : "+" }}</span>
      </button>
      <div
        v-if="open === s.name"
        class="grid grid-cols-2 gap-4 border-t border-slate-100 px-5 py-4 text-sm"
      >
        <div>
          <div class="text-xs font-bold text-emerald-700">得意なこと</div>
          <p class="mt-1">{{ s.good }}</p>
        </div>
        <div>
          <div class="text-xs font-bold text-amber-700">気をつけること</div>
          <p class="mt-1">{{ s.care }}</p>
        </div>
      </div>
    </div>
  </div>

  <h3>ほかにもよく見かけるもの</h3>
  <ul>
    <li v-for="o in others" :key="o.name">
      <strong>{{ o.name }}</strong
      >：{{ o.desc }}
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
          <strong>{{ d.name }}</strong>
        </td>
        <td>{{ d.engine }}</td>
        <td>{{ d.desc }}</td>
      </tr>
    </tbody>
  </table>

  <h2>なぜ今回は Cloudflare Workers？</h2>
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
