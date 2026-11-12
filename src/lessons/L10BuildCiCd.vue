<script setup lang="ts">
import SideNote from "../components/ui/SideNote.vue";
import PrereqBox from "../components/ui/PrereqBox.vue";
import Term from "../components/ui/Term.vue";
import BrandIcon from "../components/icons/BrandIcon.vue";
import { links } from "../lib/links";
import RepoSetter from "../components/ui/RepoSetter.vue";
import DashLink from "../components/ui/DashLink.vue";
import AppIcon from "../components/icons/AppIcon.vue";
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
      >build チェックを追加して CI/CD</strong
    >
    にします。差分に注目してください。
  </p>

  <PrereqBox title="Git の commit と push">
    <p>Git は、ファイルの変更履歴を記録する道具です。この講座で使う操作は次の3つです。</p>
    <ul>
      <li>
        <code>git add .</code>：次の記録に入れる変更を選ぶ（<code>.</code>
        は「このフォルダの変更すべて」）
      </li>
      <li>
        <code>git commit -m "説明"</code
        >：選んだ変更を、説明付きの1つの記録（コミット）として手元に保存する
      </li>
      <li>
        <code>git push origin main</code>：手元のコミットを GitHub に送る。GitHub Actions はこの
        push をきっかけに動く
      </li>
    </ul>
    <p>
      <code>origin</code> は送り先の GitHub リポジトリにつけた名前、<code>main</code>
      はブランチ（作業の流れ）の名前です。送り先は <code>git remote -v</code> で確認できます。
    </p>
    <CodeBlock :code="s.gitPush" />
  </PrereqBox>

  <HandsonStep
    :step="1"
    title="GitHub にリポジトリを作って push する"
    why="GitHub Actions はリポジトリの中のワークフローを読んで動くため。"
  >
    <p>
      テンプレートを使った場合は、第1回でフォークして clone した自分のリポジトリを使います。
      持ち込みプロジェクトの場合は、GitHub で空のリポジトリを作り、表示された手順で push
      してください。
    </p>
    <DashLink brand="github" :href="links.ghNewRepo" :path="['GitHub', 'New repository']" />
    <p>
      作ったリポジトリをここに入れておくと、この先の手順のリンクがそのリポジトリを直接開きます。
    </p>
    <RepoSetter />
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
        <strong>My Profile → API Tokens</strong> を開き、<strong>Create Token</strong> を押す
        <DashLink
          brand="cloudflare"
          :href="links.cfApiTokens"
          :path="['My Profile', 'API Tokens', 'Create Token']"
        />
      </li>
      <li>
        テンプレート
        <strong>「Edit Cloudflare Workers」</strong> を選び、自分のアカウントを指定して作成
      </li>
      <li>表示されたトークンをコピー（<strong>一度しか表示されない</strong>）</li>
      <li>アカウント ID は次のコマンドで確認できます</li>
    </ol>
    <p>
      トークンは、パスワードと同じように扱います。<SideNote tone="warn" title="漏れたときは"
        >このテンプレートのトークンは、Workers
        を公開する権限を持ちます。漏れると他人があなたのアカウントに公開できてしまうので、コードやチャットに貼らないようにします。漏れたら
        API Tokens のページですぐに削除します。</SideNote
      >
    </p>
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
    <DashLink
      brand="github"
      repo-page="newSecret"
      :path="['Settings', 'Secrets and variables', 'Actions', 'New repository secret']"
    />
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
        GitHub の <strong>Actions</strong> タブでワークフローが動き、<AppIcon
          name="checkCircle"
          :size="18"
          class="inline align-[-0.25em] text-emerald-600"
        />
        になる。公開URLにアクセスすると最新のコードで動いている。
      </p>
      <DashLink brand="githubactions" repo-page="actions" :path="['リポジトリ', 'Actions']" />
    </template>
    <template #errors>
      <ul>
        <li>
          <code>Authentication error [code: 10000]</code> → トークンの権限不足か、Secret
          名のスペルミス
        </li>
        <li>
          <Term id="npmCi"><code>npm ci</code></Term> で失敗 →
          <code>package-lock.json</code> がコミットされているか確認
        </li>
      </ul>
    </template>
    <template #check>
      <CheckItem id="h10-cd" label="push だけで自動デプロイされた" />
    </template>
  </HandsonStep>

  <HandsonStep
    :step="5"
    title="build チェックを用意する"
    why="壊れたコードを「公開前に」機械が見つけられるようにするため。"
  >
    <p>
      ここでいう build
      は、<strong>型チェック</strong>（<code>tsc</code>）と、公開用の1ファイルにまとめられるかの確認（<code
        >--dry-run</code
      >
      なので公開はしない）の2つです。
    </p>
    <template v-if="progress.projectMode === 'template'">
      <p>
        共通テンプレートには <code>build</code> スクリプトが入っています。<code>package.json</code>
        を開いて確かめましょう。
      </p>
      <CodeBlock :code="s.packageScripts" title="package.json" />
    </template>
    <template v-else>
      <p>
        TypeScript をインストールし、<code>package.json</code> の scripts に
        <code>build</code> を追加します。
      </p>
      <CodeBlock :code="s.typescriptInstall" />
      <CodeBlock :code="s.packageScripts" title="package.json" />
    </template>
    <p>手元で一度動かして、エラーが出ないことを確認します。</p>
    <CodeBlock :code="s.buildCommand" />
    <CalloutBox tone="info" title="なぜ型チェックが必要？">
      Workers
      は公開するときにコードを1つにまとめますが、このとき<strong>型はチェックしません</strong>。
      たとえば <code>c.json</code> を <code>c.jsn</code> と打ち間違えても公開は成功し、
      本番でアクセスされた瞬間に 500 エラーになります。<code>tsc</code>
      ならこれを公開前に見つけられます。
    </CalloutBox>
    <template #errors>
      <ul>
        <li>
          <code>tsc: command not found</code> → <code>npm install -D typescript</code>
          を実行したか確認
        </li>
        <li>
          型エラーが出た → エラーに書かれたファイルと行を開いて直す。<code>Did you mean</code>
          の後に正しい名前の候補が出ていることが多い
        </li>
      </ul>
    </template>
    <template #check>
      <CheckItem id="h10-build" label="ローカルで npm run build がエラーなく終わった" />
    </template>
  </HandsonStep>

  <HandsonStep
    :step="6"
    title="build に通ったときだけデプロイする"
    why="CI（build チェック）と CD（デプロイ）をつなげて、関所を作る。"
  >
    <p>
      <code>deploy.yml</code> を次のように書き換えます。ポイントは <code>needs: build</code> です。
    </p>
    <PrereqBox title="ワークフローの needs と if">
      <ul>
        <li>
          <code>needs: build</code>：build Job が成功したときだけ、この Job
          を始める。書かないと、2つの Job は同時に走り始める
        </li>
        <li>
          <code>if: github.event_name == 'push'</code>：きっかけ（event）が push
          のときだけ動く。Pull Request では build だけ走り、公開はしない
        </li>
      </ul>
    </PrereqBox>
    <CodeBlock :code="s.workflowCiCd" title=".github/workflows/deploy.yml" />
    <CalloutBox tone="info" title="何が変わった？">
      <ul class="list-disc space-y-1 pl-5">
        <li>Job が <code>build</code> と <code>deploy</code> の2つに分かれた</li>
        <li><code>needs: build</code> により、build が成功しないと deploy は始まらない</li>
        <li>
          <Term id="pr">Pull Request</Term> でも build は走るが、公開は main への push のときだけ
        </li>
      </ul>
    </CalloutBox>
    <template #check>
      <CheckItem
        id="h10-cicd"
        label="push して build → deploy の順に成功（緑のチェック）になった"
      />
    </template>
  </HandsonStep>

  <CalloutBox tone="tip" title="第2回の成果物">
    Push を起点に build チェックが走り、成功した場合だけ Workers
    へ自動デプロイされるワークフローが完成しました。
  </CalloutBox>

  <h2>発展：テストで「動作」も確かめる</h2>
  <p>
    build が見つけられるのは「コードとして壊れている」ものだけです。あいさつを
    <code>Hello</code> から
    <code>Hi</code>
    に変えてしまったような、<strong>コードは正しいが仕様と違う</strong>変更は通ってしまいます。これを止めるのがテストです。余裕のある人は試してみましょう。
  </p>
  <details class="group my-8 rounded-2xl bg-white px-7 py-5 shadow-[0_0_0_1px_var(--color-line)]">
    <summary
      class="flex cursor-pointer list-none items-center gap-3 font-bold [&::-webkit-details-marker]:hidden"
    >
      <BrandIcon name="vitest" :size="20" />
      Vitest でテストを追加する手順
      <AppIcon
        name="plus"
        :size="16"
        :stroke="2"
        class="ml-auto text-ink/40 transition-transform group-open:rotate-45"
      />
    </summary>
    <div class="prose-lesson mt-4">
      <p><strong>1.</strong> Vitest をインストールする</p>
      <CodeBlock :code="s.vitestInstall" />
      <p>
        <strong>2.</strong> <code>package.json</code> の scripts に <code>test</code> を追加する
      </p>
      <CodeBlock :code="s.testScript" title="package.json（scripts に追記）" />
      <p>
        <strong>3.</strong> テストを書く。Hono の <code>app.request()</code>
        を使うと、サーバーを起動しなくても API を呼び出せます
      </p>
      <CodeBlock :code="s.honoTest" title="test/index.test.ts" />
      <p><strong>4.</strong> ワークフローの build Job に1行足す</p>
      <CodeBlock
        :code="s.workflowTestStep"
        title=".github/workflows/deploy.yml（build Job の steps）"
      />
    </div>
  </details>
</template>
