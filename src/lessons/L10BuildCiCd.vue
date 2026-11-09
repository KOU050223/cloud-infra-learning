<script setup lang="ts">
import CalloutBox from "../components/ui/CalloutBox.vue";
import CheckItem from "../components/ui/CheckItem.vue";
import CodeBlock from "../components/ui/CodeBlock.vue";
import HandsonStep from "../components/ui/HandsonStep.vue";
import * as s from "../data/snippets";
import { useProgressStore } from "../stores/progress";

const progress = useProgressStore();
</script>

<template>
  <p>
    第1回で公開した API に CI/CD を組み込みます。まず
    <strong>CD だけ</strong>を作って自動デプロイを体験し、 そのあと<strong
      >テストを追加して CI/CD</strong
    >
    にします。差分に注目してください。
  </p>

  <HandsonStep
    :step="1"
    title="GitHub にリポジトリを作って push する"
    why="GitHub Actions はリポジトリの中のワークフローを読んで動くため。"
  >
    <p>
      GitHub で空のリポジトリを作成し、表示された手順で第1回のプロジェクトを push します。
      <template v-if="progress.projectMode === 'template'">
        テンプレートを clone した場合は、<code
          >git remote set-url origin &lt;新しいリポジトリのURL&gt;</code
        >
        で push 先を自分のリポジトリに変えてください。
      </template>
    </p>
    <template #check>
      <CheckItem id="h10-repo" label="自分の GitHub リポジトリにコードが push されている" />
    </template>
  </HandsonStep>

  <HandsonStep
    :step="2"
    title="Cloudflare の API トークンとアカウントIDを用意する"
    why="GitHub のマシンはあなたの PC と違って wrangler login していないため、代わりの鍵を渡す。"
  >
    <ol>
      <li>
        Cloudflare ダッシュボード右上のアイコン →
        <strong>My Profile → API Tokens → Create Token</strong>
      </li>
      <li>
        テンプレート
        <strong>「Edit Cloudflare Workers」</strong> を選び、自分のアカウントを指定して作成
      </li>
      <li>表示されたトークンをコピー（<strong>一度しか表示されない</strong>）</li>
      <li>アカウント ID は次のコマンドで確認できます</li>
    </ol>
    <CodeBlock :code="s.whoami" />
    <template #check>
      <CheckItem id="h10-token" label="API トークンとアカウントIDを手元に用意した" />
    </template>
  </HandsonStep>

  <HandsonStep
    :step="3"
    title="GitHub Secrets に登録する"
    why="トークンを YAML に書かずに、安全にワークフローへ渡すため。"
  >
    <p>
      リポジトリの
      <strong>Settings → Secrets and variables → Actions → New repository secret</strong>
      から、次の2つを登録します。
    </p>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Secret</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>CLOUDFLARE_API_TOKEN</code></td>
          <td>手順2で作ったトークン</td>
        </tr>
        <tr>
          <td><code>CLOUDFLARE_ACCOUNT_ID</code></td>
          <td>アカウント ID</td>
        </tr>
      </tbody>
    </table>
    <template #check>
      <CheckItem id="h10-secrets" label="2つの Secret を登録した" />
    </template>
  </HandsonStep>

  <HandsonStep
    :step="4"
    title="CD だけのワークフローを作る"
    why="まずは「push したら公開される」を体験する。"
  >
    <CodeBlock :code="s.workflowCdOnly" title=".github/workflows/deploy.yml" />
    <CodeBlock :code="s.gitPush" />
    <template #expected>
      <p class="text-sm">
        GitHub の <strong>Actions</strong> タブでワークフローが動き、✅
        になる。公開URLにアクセスすると最新のコードで動いている。
      </p>
    </template>
    <template #errors>
      <ul>
        <li>
          <code>Authentication error [code: 10000]</code> → トークンの権限不足か、Secret
          名のスペルミス
        </li>
        <li>
          <code>npm ci</code> で失敗 → <code>package-lock.json</code> がコミットされているか確認
        </li>
      </ul>
    </template>
    <template #check>
      <CheckItem id="h10-cd" label="push だけで自動デプロイされた" />
    </template>
  </HandsonStep>

  <HandsonStep
    :step="5"
    title="テストを書く"
    why="「壊れていないこと」を機械が判定できるようにするため。"
  >
    <template v-if="progress.projectMode === 'template'">
      <p>
        共通テンプレートにはテストが入っています。<code>test/index.test.ts</code>
        を開いて中身を読んでみましょう。
      </p>
    </template>
    <template v-else>
      <p>Vitest をインストールし、テストを追加します。</p>
      <CodeBlock :code="s.vitestInstall" />
      <p><code>package.json</code> の scripts に <code>test</code> を追加します。</p>
      <CodeBlock :code="s.packageScripts" title="package.json" />
    </template>
    <CodeBlock :code="s.honoTest" title="test/index.test.ts" />
    <p>
      Hono の <code>app.request()</code> を使うと、サーバーを起動しなくても API
      を呼び出してテストできます。
    </p>
    <CodeBlock code="npm test" />
    <template #check>
      <CheckItem id="h10-test" label="ローカルで npm test が通った" />
    </template>
  </HandsonStep>

  <HandsonStep
    :step="6"
    title="テストを通ったときだけデプロイする"
    why="CI（テスト）と CD（デプロイ）をつなげて、関所を作る。"
  >
    <p>
      <code>deploy.yml</code> を次のように書き換えます。ポイントは <code>needs: test</code> です。
    </p>
    <CodeBlock :code="s.workflowCiCd" title=".github/workflows/deploy.yml" />
    <CalloutBox tone="info" title="何が変わった？">
      <ul class="list-disc pl-5">
        <li>Job が <code>test</code> と <code>deploy</code> の2つに分かれた</li>
        <li><code>needs: test</code> により、test が成功しないと deploy は始まらない</li>
        <li>Pull Request でもテストは走るが、公開は main への push のときだけ</li>
      </ul>
    </CalloutBox>
    <template #check>
      <CheckItem id="h10-cicd" label="push して test → deploy の順に ✅ になった" />
    </template>
  </HandsonStep>

  <CalloutBox tone="tip" title="第2回の成果物">
    Push を起点にテストが走り、成功した場合だけ Workers
    へ自動デプロイされるワークフローが完成しました。
  </CalloutBox>
</template>
