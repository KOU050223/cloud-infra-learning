<script setup lang="ts">
import CalloutBox from "../components/ui/CalloutBox.vue";
import CheckItem from "../components/ui/CheckItem.vue";
import CodeBlock from "../components/ui/CodeBlock.vue";
import HandsonStep from "../components/ui/HandsonStep.vue";
import ProjectModeSwitch from "../components/ui/ProjectModeSwitch.vue";
import * as s from "../data/snippets";
import { useProgressStore } from "../stores/progress";

const progress = useProgressStore();
</script>

<template>
  <p>
    いよいよ自分の PC で手を動かします。ゴールは
    <strong>公開 URL にアクセスして、自分の API からレスポンスが返ってくること</strong>です。
  </p>

  <h2>使うプロジェクトを選ぶ</h2>
  <ProjectModeSwitch />

  <HandsonStep
    :step="1"
    title="プロジェクトを用意する"
    why="公開する API のコードを手元に置くため。"
  >
    <template v-if="progress.projectMode === 'template'">
      <p>共通テンプレートを clone して、依存パッケージをインストールします。</p>
      <CodeBlock :code="s.cloneTemplate" />
    </template>
    <template v-else>
      <p>
        自分の Hono プロジェクトのフォルダに移動してください。まだ Workers 用になっていない場合は、
        新しく作ってからルートを移植すると確実です。
      </p>
      <CodeBlock :code="s.createOwn" />
      <CalloutBox tone="warn" title="持ち込み API の注意">
        D1 などの DB を使っている API は、本番 DB の作成やマイグレーションが別途必要です。 今日は DB
        を使わないルートだけで公開するか、共通テンプレートに切り替えるのがおすすめです。
      </CalloutBox>
    </template>
    <p><code>src/index.ts</code> が次のようになっていることを確認しましょう。</p>
    <CodeBlock :code="s.honoIndex" title="src/index.ts" />
    <template #check>
      <CheckItem
        id="h05-project"
        label="src/index.ts を開いて、ルートが定義されているのを確認した"
      />
    </template>
  </HandsonStep>

  <HandsonStep
    :step="2"
    title="ローカルで動かす"
    why="公開する前に、手元で正しく動くことを確認するため。"
  >
    <CodeBlock :code="s.devCommand" />
    <p>別のターミナルを開くか、ブラウザで次の URL にアクセスします。</p>
    <CodeBlock :code="s.curlLocal" />
    <template #expected>
      <CodeBlock :code="s.helloResponse" title="レスポンス" />
    </template>
    <template #errors>
      <ul>
        <li>
          <code>wrangler: command not found</code> → <code>npm install</code> を実行したか確認
        </li>
        <li>
          <code>Address already in use</code> → 8787
          番ポートを他のプロセスが使っている。前に起動した dev を止める
        </li>
      </ul>
    </template>
    <template #check>
      <CheckItem id="h05-local" label="localhost:8787 から JSON が返ってきた" />
    </template>
  </HandsonStep>

  <HandsonStep
    :step="3"
    title="Wrangler の設定を確認する"
    why="name が公開 URL の一部になり、他の人と重複できないため。"
  >
    <CodeBlock :code="s.wranglerConfig" title="wrangler.jsonc" />
    <p>
      <code>name</code> を自分だけの名前（例：<code>taro-hello-api</code>）に変えておきましょう。
    </p>
    <template #check>
      <CheckItem id="h05-config" label="wrangler.jsonc の name を自分用に変えた" />
    </template>
  </HandsonStep>

  <HandsonStep
    :step="4"
    title="Cloudflare にログインする"
    why="どのアカウントに公開するかを Wrangler に教えるため。"
  >
    <CodeBlock :code="s.wranglerLogin" />
    <template #expected>
      <p class="text-sm">
        ブラウザが開くので「Allow」を押す。ターミナルに
        <code>Successfully logged in.</code> と出れば OK。
      </p>
    </template>
    <template #errors>
      <ul>
        <li>ブラウザが開かない → ターミナルに表示された URL を手でコピーして開く</li>
        <li>
          workers.dev のサブドメインが未設定と言われた → ダッシュボードの「Workers &
          Pages」を一度開いて登録する
        </li>
      </ul>
    </template>
    <template #check>
      <CheckItem id="h05-login" label="wrangler login に成功した" />
    </template>
  </HandsonStep>

  <HandsonStep
    :step="5"
    title="公開する"
    why="ここで初めて、インターネット上の誰からでもアクセスできるようになる。"
  >
    <CodeBlock :code="s.wranglerDeploy" />
    <template #expected>
      <CodeBlock
        code="Uploaded taro-hello-api
Deployed taro-hello-api triggers
  https://taro-hello-api.<あなたのサブドメイン>.workers.dev"
        title="出力（抜粋）"
      />
    </template>
    <template #errors>
      <ul>
        <li>
          <code>A worker with this name already exists</code> 系のエラー → name を別の名前に変える
        </li>
        <li>認証エラー → もう一度 <code>npx wrangler login</code></li>
      </ul>
    </template>
    <template #check>
      <CheckItem id="h05-deploy" label="デプロイが成功し、公開URLが表示された" />
    </template>
  </HandsonStep>

  <HandsonStep
    :step="6"
    title="公開URLで疎通確認"
    why="本当に外から使えるかを、自分の目で確かめるため。"
  >
    <CodeBlock :code="s.curlProd" />
    <p>スマホのブラウザや、隣の人の PC からもアクセスしてみましょう。</p>
    <template #check>
      <CheckItem id="h05-public" label="公開URLから JSON が返ってきた" />
      <CheckItem id="h05-friend" label="自分以外の端末からもアクセスできた" />
    </template>
  </HandsonStep>

  <CalloutBox tone="tip" title="第1回の成果物">
    公開URLからレスポンスが取得できる Hono API ができました！ URL をメモしておきましょう。
  </CalloutBox>
</template>
