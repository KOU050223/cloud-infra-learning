<script setup lang="ts">
import CalloutBox from "../components/ui/CalloutBox.vue";
import CodeBlock from "../components/ui/CodeBlock.vue";
import QuizCard from "../components/ui/QuizCard.vue";
import * as s from "../data/snippets";
</script>

<template>
  <p>公開できたら終わり、ではありません。公開した瞬間から「動かし続ける」責任が生まれます。</p>

  <h2>💸 お金：無料枠とクラウド破産</h2>
  <p>
    クラウドの多くは<strong>使った分だけ払う従量課金</strong>です。設定ミスや攻撃でアクセスが急増すると、
    気づいたときには高額請求……ということが実際に起きています（いわゆる「クラウド破産」）。
  </p>
  <ul>
    <li>
      Workers の無料プランは 1日10万リクエストまで。超えるとエラーになるだけで<strong
        >課金はされない</strong
      >
    </li>
    <li>有料プランや AWS などでは、<strong>予算アラート</strong>や利用上限を必ず設定する</li>
    <li>使わなくなったリソースは削除する。「動かしっぱなし」が一番もったいない</li>
  </ul>

  <h2>🔑 Secret：秘密の値をコードに書かない</h2>
  <p>
    外部 API のキーなどをコードに直接書いて GitHub に push すると、世界中に公開されてしまいます。
    Workers では Secret として登録し、コードからは環境変数として読み出します。
  </p>
  <CodeBlock :code="s.secretPut" />
  <p>
    ローカル開発用の値は <code>.dev.vars</code> に書き、<code>.gitignore</code> に入れておきます。
  </p>

  <h2>📜 ログ：何が起きているかを見る</h2>
  <p>本番でエラーが起きても、ユーザーの画面は見られません。ログが唯一の手がかりです。</p>
  <CodeBlock :code="s.wranglerTail" />
  <p>
    リアルタイムでリクエストとエラーが流れてきます。<code>observability</code> を有効にしておけば、
    Cloudflare ダッシュボードから過去のログも検索できます。
  </p>

  <QuizCard
    question="外部APIのキーを使う処理を書いた。キーの扱いとして正しいのは？"
    :options="[
      {
        label: 'src/index.ts に直接書いて push する',
        explain: 'GitHub に公開されると、数分で悪用されることもあります。',
      },
      {
        label: 'wrangler secret put で登録し、コードでは c.env から読む',
        correct: true,
        explain: 'Secret は暗号化して保存され、コードやリポジトリには残りません。',
      },
      {
        label: 'README に書いておく',
        explain: 'README もリポジトリの一部なので公開されてしまいます。',
      },
    ]"
  />

  <h2>第1回のまとめ</h2>
  <ul>
    <li>localhost は自分の PC の中だけ。公開するにはインフラが必要</li>
    <li>リクエストは DNS → HTTPS → エッジ → Hono と旅をして返ってくる</li>
    <li>クラウドは Compute / DB / Storage / Network / Identity の組み合わせ</li>
    <li>技術選定はデプロイ先から逆算する。今回は Hono × Workers</li>
    <li>公開後はお金・Secret・ログに気を配る</li>
  </ul>

  <CalloutBox tone="info" title="次回予告">
    コードを直すたびに手で <code>npm run deploy</code> するのは面倒だし、うっかりも起きます。
    第2回では、push するだけでテストとデプロイが自動で走る仕組み（CI/CD）を作ります。
  </CalloutBox>
</template>
