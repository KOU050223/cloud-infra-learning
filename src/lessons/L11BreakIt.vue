<script setup lang="ts">
import MangaPanel from "../components/ui/MangaPanel.vue";
import SideNote from "../components/ui/SideNote.vue";
import DashLink from "../components/ui/DashLink.vue";
import AppIcon from "../components/icons/AppIcon.vue";
import CalloutBox from "../components/ui/CalloutBox.vue";
import CheckItem from "../components/ui/CheckItem.vue";
import CodeBlock from "../components/ui/CodeBlock.vue";
import HandsonStep from "../components/ui/HandsonStep.vue";
import * as s from "../data/snippets";
</script>

<template>
  <p>
    作った関所が本当に働くか、わざとコードを壊して確かめます。シミュレーターでやったことを、本物の環境で再現します。
  </p>

  <CalloutBox tone="tip" title="ターミナルでも試せます">
    右下のターミナルで「公開済みから」を押し、上部の <code>src/index.ts</code> を「jsn
    の打ち間違い」に切り替えてみましょう。<code>npm run build</code> は失敗し、<code
      >npm run deploy</code
    >
    は成功してしまい、本番に curl すると 500 が返る、という違いを確かめられます。
  </CalloutBox>

  <HandsonStep
    :step="1"
    title="わざと壊す"
    why="型チェックで引っかかる、よくある打ち間違いを再現する。"
  >
    <p><code>c.json</code> を <code>c.jsn</code> と打ち間違えてみます。</p>
    <CodeBlock :code="s.breakCode" title="src/index.ts" />
    <CodeBlock :code="s.breakPush" />
    <template #expected>
      <p class="text-sm">
        Actions タブで
        <strong
          >build が
          <AppIcon
            name="crossCircle"
            :size="18"
            class="inline align-[-0.25em] text-rose-600" /></strong
        >、<strong>deploy はスキップ</strong>される。
      </p>
      <DashLink brand="githubactions" repo-page="actions" :path="['リポジトリ', 'Actions']" />
    </template>
    <template #check>
      <CheckItem id="h11-fail" label="build が失敗し、deploy が実行されなかった" />
    </template>
  </HandsonStep>

  <HandsonStep
    :step="2"
    title="本番が守られていることを確認する"
    why="CI の価値は「壊れたものを出さない」こと。"
  >
    <p>
      CI がなければ、この打ち間違いはそのまま公開され、<code>/hello</code>
      へのアクセスは 500 エラーになっていました。本番がどうなっているか見てみましょう。
    </p>
    <CodeBlock :code="s.curlProd" />
    <template #expected>
      <CodeBlock :code="s.helloResponse" title="レスポンス（壊れる前のまま）" />
    </template>
    <template #check>
      <CheckItem id="h11-safe" label="本番は前のバージョンのまま正常に動いていた" />
    </template>
  </HandsonStep>

  <MangaPanel id="m11" />

  <HandsonStep
    :step="3"
    title="ログを読んで原因を見つける"
    why="失敗したときに自力で原因を探す練習。"
  >
    <p>
      Actions タブで失敗したワークフロー → <code>build</code> Job → <code>npm run build</code> の
      Step を開きます。
    </p>
    <DashLink
      brand="githubactions"
      repo-page="actions"
      :path="['Actions', '失敗したワークフロー', 'build', 'npm run build']"
    />
    <CodeBlock :code="s.buildFailureLog" title="ログ（抜粋）" />
    <p>
      <code>src/index.ts(6,34)</code> は「6行目の34文字目」という意味です。<code
        >Did you mean 'json'?</code
      >
      と、正しい名前の候補まで教えてくれています。
    </p>
    <template #check>
      <CheckItem id="h11-log" label="ログからエラーの場所と原因を見つけた" />
    </template>
  </HandsonStep>

  <HandsonStep :step="4" title="直して再公開する" why="修正を push すれば、また自動で公開される。">
    <p>
      <code>jsn</code> を <code>json</code> に戻して push します。<SideNote
        title="すぐ前の版に戻したいとき"
        ><code>npx wrangler rollback</code> で、公開中の Worker を前のデプロイに戻せます。ただし
        GitHub のコードは壊れたままなので、あとでコードも直して push します。</SideNote
      >
    </p>
    <CodeBlock :code="s.fixPush" />
    <template #check>
      <CheckItem
        id="h11-fixed"
        label="build と deploy が成功（緑のチェック）になり、再公開された"
      />
    </template>
  </HandsonStep>

  <h2>build では止められないもの</h2>
  <p>次のように、あいさつを <code>Hello</code> から <code>Hi</code> に変えた場合はどうでしょう。</p>
  <CodeBlock :code="s.wrongCode" title="src/index.ts" />
  <p>
    これはコードとして正しいので、build は<strong>通ってしまい</strong>、そのまま公開されます。
    「仕様どおりに動くか」を確かめるには、期待する結果を書いたテストが必要です。L10
    の「発展」でテストを追加していれば、次のように差分を指摘して止めてくれます。
  </p>
  <CodeBlock :code="s.testFailureLog" title="テストのログ（抜粋）" />

  <CalloutBox tone="info" title="チェックは段階的に増やせばいい">
    まずは
    build（型チェック）で「壊れたコード」を止める。慣れてきたらテストで「おかしな動作」も止める。 CI
    は最初から完璧である必要はなく、困ったことが起きるたびに関所を足していくものです。
  </CalloutBox>
</template>
