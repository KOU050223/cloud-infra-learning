<script setup lang="ts">
import MangaPanel from "../components/ui/MangaPanel.vue";
import CalloutBox from "../components/ui/CalloutBox.vue";
import QuizCard from "../components/ui/QuizCard.vue";
</script>

<template>
  <MangaPanel id="m01" />

  <p>なぜ先輩のスマホでは開けなかったのでしょうか。まず予想してみましょう。</p>

  <QuizCard
    question="リタ猫先輩が自分のスマホで http://localhost:8787 を開くと、どうなる？"
    :options="[
      {
        label: 'あなたのPCで動いているAPIの結果が見られる',
        explain:
          'localhost は「今アクセスしている端末自身」を指す特別な名前です。リタ猫先輩のスマホからだと、リタ猫先輩のスマホ自身を探しに行きます。',
      },
      {
        label: 'リタ猫先輩のスマホ自身にアクセスしようとして、つながらない',
        correct: true,
        explain: 'localhost は常に「自分自身」。あなたのAPIはあなたのPCの中でしか見えていません。',
      },
      {
        label: 'インターネット上から自動で探して表示される',
        explain: 'インターネット上に公開する作業をしない限り、誰からも見つけられません。',
      },
    ]"
  />

  <h2>localhost と公開環境</h2>
  <table>
    <thead>
      <tr>
        <th>観点</th>
        <th>localhost（手元）</th>
        <th>公開環境（本番）</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>誰が使える？</td>
        <td>自分のPCだけ</td>
        <td>インターネットにつながる全員</td>
      </tr>
      <tr>
        <td>いつ動いている？</td>
        <td>自分がPCを開いて起動している間</td>
        <td>24時間365日</td>
      </tr>
      <tr>
        <td>アクセスが急増したら？</td>
        <td>想定しない</td>
        <td>耐えられるようにする必要がある</td>
      </tr>
      <tr>
        <td>URL</td>
        <td><code>http://localhost:8787</code></td>
        <td><code>https://my-api.example.workers.dev</code></td>
      </tr>
    </tbody>
  </table>

  <h2>インフラとは</h2>
  <p>
    <strong>インフラ（インフラストラクチャー）</strong
    >は、アプリを「ユーザーに届け続ける」ための土台です。
    電気・水道・道路が生活を支えているように、サーバー・ネットワーク・データベースなどがアプリを支えています。
  </p>
  <h3>インフラを担当する人の仕事</h3>
  <ul>
    <li><strong>置く</strong>：アプリを動かす場所（サーバーやクラウド）を用意し、公開する</li>
    <li>
      <strong>つなぐ</strong>：ドメイン・HTTPS・ネットワークを設定し、ユーザーのリクエストを届ける
    </li>
    <li><strong>守る</strong>：不正アクセスや秘密情報の漏えいを防ぐ</li>
    <li><strong>見張る</strong>：ログや監視で異常に気づき、障害から復旧する</li>
    <li><strong>自動化する</strong>：デプロイや環境構築を、誰がやっても同じ結果になるようにする</li>
  </ul>

  <CalloutBox tone="info" title="なぜインフラを学ぶと得をするのか">
    フロントエンドでもバックエンドでも、作ったものは最終的にどこかへ公開されます。デプロイ先の特徴を知っていると
    「この構成なら無料で動く」「このライブラリはこの環境では動かない」と、<strong
      >デプロイ先から逆算して技術を選べる</strong
    >
    ようになります。インフラやSREは専門人材が少なく、キャリアの武器にもなります。
  </CalloutBox>

  <p>
    次のレッスンでは、公開された API に URL
    でアクセスしたとき、裏側で何が起きているのかを1ステップずつ追いかけます。
  </p>
</template>
