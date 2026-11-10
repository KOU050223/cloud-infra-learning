<script setup lang="ts">
import MangaPanel from "../components/ui/MangaPanel.vue";
import Term from "../components/ui/Term.vue";
import RequestJourney from "../components/sim/RequestJourney.vue";
import QuizCard from "../components/ui/QuizCard.vue";
</script>

<template>
  <p>
    ブラウザに URL を入れてから JSON
    が表示されるまでに、リクエストはいくつもの場所を経由しています。
    「次へ」を押して、リクエストの旅を追いかけてみましょう。URL
    のパスを書き換えると、結果も変わります。
  </p>

  <MangaPanel id="m02" />

  <RequestJourney />

  <h2>ポイント</h2>
  <ul>
    <li>
      <strong>DNS</strong>：ドメイン名を <Term id="ip">IP アドレス</Term> に変換する「電話帳」
    </li>
    <li><strong>HTTPS</strong>：通信を暗号化した HTTP。今の Web では必須</li>
    <li>
      <strong>エッジ</strong>：ユーザーの近くにあるサーバー。Cloudflare Workers
      はここでコードを実行する
    </li>
    <li>
      <strong>ルーティング</strong>：パスに応じてどの処理を動かすか決める。Hono の
      <code>app.get()</code> がこれ
    </li>
  </ul>

  <QuizCard
    question="https://my-api.example.workers.dev/users にアクセスしたら 404 が返ってきた。最もありそうな原因は？"
    :options="[
      {
        label: 'DNS が IP アドレスを見つけられなかった',
        explain:
          'DNS で失敗すると、そもそもサーバーにたどり着けず、ブラウザのエラー画面になります。404 はサーバーまで届いた証拠です。',
      },
      {
        label: 'Hono に /users のルートが定義されていない',
        correct: true,
        explain: '404 はサーバー（Hono）が「そのパスは知らない」と答えた状態です。',
      },
      {
        label: 'HTTPS の暗号化に失敗した',
        explain: '暗号化に失敗すると接続自体ができず、HTTP のステータスコードは返ってきません。',
      },
    ]"
  />
</template>
