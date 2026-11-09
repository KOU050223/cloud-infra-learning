<script setup lang="ts">
import CalloutBox from "../components/ui/CalloutBox.vue";
import CheckItem from "../components/ui/CheckItem.vue";
import CodeBlock from "../components/ui/CodeBlock.vue";
import HandsonStep from "../components/ui/HandsonStep.vue";
import * as s from "../data/snippets";
</script>

<template>
  <p>
    作った関所が本当に働くか、わざとバグを入れて確かめます。シミュレーターでやったことを、本物の環境で再現します。
  </p>

  <HandsonStep
    :step="1"
    title="わざと壊す"
    why="テストが期待している結果と違うレスポンスを返すようにする。"
  >
    <p><code>Hello</code> を <code>Hi</code> に変えてみます。</p>
    <CodeBlock :code="s.breakCode" title="src/index.ts" />
    <CodeBlock :code="s.breakPush" />
    <template #expected>
      <p class="text-sm">
        Actions タブで <strong>test が ❌</strong>、<strong>deploy はスキップ</strong>される。
      </p>
    </template>
    <template #check>
      <CheckItem id="h11-fail" label="test が失敗し、deploy が実行されなかった" />
    </template>
  </HandsonStep>

  <HandsonStep
    :step="2"
    title="本番が守られていることを確認する"
    why="CI の価値は「壊れたものを出さない」こと。"
  >
    <CodeBlock :code="s.curlProd" />
    <template #expected>
      <CodeBlock :code="s.helloResponse" title="レスポンス（変わっていない）" />
    </template>
    <template #check>
      <CheckItem id="h11-safe" label="本番はまだ Hello のまま動いていた" />
    </template>
  </HandsonStep>

  <HandsonStep
    :step="3"
    title="ログを読んで原因を見つける"
    why="失敗したときに自力で原因を探す練習。"
  >
    <p>
      Actions タブで失敗したワークフロー → <code>test</code> Job → <code>npm test</code> の Step
      を開きます。
    </p>
    <CodeBlock :code="s.testFailureLog" title="ログ（抜粋）" />
    <template #check>
      <CheckItem id="h11-log" label="ログで期待値と実際の値の違いを見つけた" />
    </template>
  </HandsonStep>

  <HandsonStep :step="4" title="直して再公開する" why="修正を push すれば、また自動で公開される。">
    <p><code>Hi</code> を <code>Hello</code> に戻して push します。</p>
    <CodeBlock :code="s.fixPush" />
    <template #check>
      <CheckItem id="h11-fixed" label="test と deploy が ✅ になり、再公開された" />
    </template>
  </HandsonStep>

  <CalloutBox tone="info" title="仕様変更ならテストも変える">
    もし「あいさつを Hi に変える」のが正しい仕様変更なら、テストの期待値も一緒に更新します。
    テストは「今の正しい仕様」を表すものなので、コードと一緒に育てていきましょう。
  </CalloutBox>
</template>
