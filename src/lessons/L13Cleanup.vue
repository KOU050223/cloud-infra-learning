<script setup lang="ts">
import SideNote from "../components/ui/SideNote.vue";
import { links } from "../lib/links";
import DashLink from "../components/ui/DashLink.vue";
import CalloutBox from "../components/ui/CalloutBox.vue";
import CheckItem from "../components/ui/CheckItem.vue";
import CodeBlock from "../components/ui/CodeBlock.vue";
import HandsonStep from "../components/ui/HandsonStep.vue";
import * as s from "../data/snippets";

const inventory: { what: string; where: string; made: string; how: string }[] = [
  {
    what: "GitHub Actions のワークフロー",
    where: "GitHub",
    made: "L10",
    how: "無効化する",
  },
  {
    what: "Worker（公開した API）と、その Secret",
    where: "Cloudflare",
    made: "L05・L06",
    how: "wrangler delete",
  },
  {
    what: "API トークン",
    where: "Cloudflare",
    made: "L10",
    how: "ダッシュボードで削除",
  },
  {
    what: "CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID",
    where: "GitHub Secrets",
    made: "L10",
    how: "リポジトリの設定で削除",
  },
  {
    what: "Wrangler のログイン情報",
    where: "自分の PC",
    made: "L05",
    how: "wrangler logout",
  },
];
</script>

<template>
  <p>
    講座の最後に、作ったものを片付けます。ゴールは
    <strong>講座で作った Cloudflare のリソースと鍵が、どこにも残っていないこと</strong>です。
  </p>
  <p>
    使わないリソースを動かしっぱなしにすると、思わぬ請求や攻撃の入り口になります（L06）。
    作ったものを把握して、自分の手で消せるところまでがインフラの仕事です。
  </p>

  <h2>片付けるもの</h2>
  <p>この講座で作ったものは、次の5つです。上から順に片付けます。</p>
  <table>
    <thead>
      <tr>
        <th>作ったもの</th>
        <th>場所</th>
        <th>作ったレッスン</th>
        <th>片付け方</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in inventory" :key="item.what">
        <td>{{ item.what }}</td>
        <td>{{ item.where }}</td>
        <td>{{ item.made }}</td>
        <td>{{ item.how }}</td>
      </tr>
    </tbody>
  </table>
  <CalloutBox tone="warn" title="順番が大事">
    先に自動デプロイを止めないと、Worker を消したあとに誰かが push しただけで、ワークフローが Worker
    を作り直してしまいます。<strong>作り直す仕組みを止めてから、本体を消す</strong>のが基本です。
  </CalloutBox>

  <CalloutBox tone="tip" title="サイトの中で試せます">
    右下のターミナルで「第1回を終えた状態」から始めると、<code>npx wrangler delete</code> と
    <code>npx wrangler logout</code> を本番の前に試せます。
  </CalloutBox>

  <HandsonStep
    :step="1"
    title="自動デプロイを止める"
    why="ワークフローが残っていると、push のたびに Worker が作り直されるため。"
  >
    <ol>
      <li>リポジトリの <strong>Actions</strong> タブを開く</li>
      <li>左の一覧から <strong>CI/CD</strong>（<code>deploy.yml</code>）のワークフローを選ぶ</li>
      <li>右上の <strong>…</strong> から <strong>Disable workflow</strong> を押す</li>
    </ol>
    <DashLink
      brand="githubactions"
      repo-page="workflow"
      :path="['Actions', 'CI/CD', '…', 'Disable workflow']"
    />
    <p>
      <code>.github/workflows/deploy.yml</code> を削除して push
      しても止められます。リポジトリごと不要なら、 リポジトリを削除してもかまいません。<SideNote
        title="リポジトリは残してもいい？"
        >残してかまいません。手順4で Secrets を消せば、リポジトリに Cloudflare
        の鍵は残りません。作ったものの記録として、ポートフォリオにも使えます。</SideNote
      >
    </p>
    <template #check>
      <CheckItem id="h13-workflow" label="ワークフローを無効化した（または削除した）" />
    </template>
  </HandsonStep>

  <HandsonStep
    :step="2"
    title="Worker を削除する"
    why="公開した API をインターネットから取り下げるため。Worker に登録した Secret も一緒に消える。"
  >
    <p>
      第1回のプロジェクトのフォルダ（<code>wrangler.jsonc</code> があるところ）で実行します。
      <code>wrangler.jsonc</code> の <code>name</code> の Worker が削除の対象です。
    </p>
    <CodeBlock :code="s.wranglerDelete" />
    <template #expected>
      <p class="text-sm">
        削除してよいかを聞かれるので、名前が自分の Worker であることを確かめてから
        <code>y</code> を入力する。<code>Successfully deleted ○○</code> と出れば OK。
      </p>
    </template>
    <template #errors>
      <ul>
        <li>
          <code>You are not authenticated</code> → ログインが切れている。<code
            >npx wrangler login</code
          >
          してからもう一度実行する
        </li>
        <li>
          <code>not found</code> → フォルダが違うか、<code>name</code>
          を途中で変えた。ダッシュボードの Workers &amp; Pages から自分の Worker を選び、Settings
          の一番下にある Delete で削除する
          <DashLink
            brand="cloudflare"
            :href="links.cfWorkers"
            :path="['Workers & Pages', '自分の Worker', 'Settings', 'Delete']"
          />
        </li>
      </ul>
    </template>
    <template #check>
      <CheckItem id="h13-delete" label="Successfully deleted と表示された" />
    </template>
  </HandsonStep>

  <HandsonStep
    :step="3"
    title="消えたことを確かめる"
    why="「消したつもり」で残っているのが一番危ないため。"
  >
    <p>L05 で使った公開 URL に、もう一度アクセスします。</p>
    <CodeBlock :code="s.curlProd" />
    <p>
      JSON ではなく Cloudflare のエラーが返れば、削除できています。続けて、ダッシュボードの Workers
      &amp; Pages の一覧も開きます。
    </p>
    <DashLink brand="cloudflare" :href="links.cfWorkers" :path="['Workers & Pages']" />
    <CalloutBox tone="info" title="名前を変えて何度も公開した人へ">
      L05 で <code>name</code> を変えて公開し直した人は、古い名前の Worker
      も残っています。一覧に講座で作った Worker
      が残っていれば、手順2のダッシュボードの方法ですべて削除します。
    </CalloutBox>
    <template #check>
      <CheckItem id="h13-gone" label="公開 URL から JSON が返らなくなった" />
      <CheckItem
        id="h13-list"
        label="Workers & Pages の一覧に、講座で作った Worker が残っていない"
      />
    </template>
  </HandsonStep>

  <HandsonStep
    :step="4"
    title="API トークンと GitHub Secrets を削除する"
    why="使わない鍵は、漏れたときに悪用される入り口になるだけなので。"
  >
    <p>まず、L10 で作った Cloudflare の API トークンを削除します。</p>
    <ol>
      <li>
        <strong>My Profile → API Tokens</strong> を開く
        <DashLink
          brand="cloudflare"
          :href="links.cfApiTokens"
          :path="['My Profile', 'API Tokens']"
        />
      </li>
      <li>
        L10 で作ったトークン（「Edit Cloudflare Workers」から作ったもの）の右の
        <strong>…</strong> から <strong>Delete</strong> を押す
      </li>
    </ol>
    <p>次に、GitHub に登録した2つの Secret を削除します。</p>
    <DashLink
      brand="github"
      repo-page="secrets"
      :path="['Settings', 'Secrets and variables', 'Actions']"
      note="CLOUDFLARE_API_TOKEN と CLOUDFLARE_ACCOUNT_ID の右のゴミ箱アイコンから削除する"
    />
    <CalloutBox tone="info" title="なぜ両方消す？">
      トークンを削除した時点で、GitHub に残った値は使えなくなります。それでも Secret
      を残しておくと「何のための値か」が分からないまま残り続けます。作った場所と登録した場所の両方から消します。
    </CalloutBox>
    <template #check>
      <CheckItem id="h13-token" label="Cloudflare の API トークンを削除した" />
      <CheckItem id="h13-secrets" label="GitHub Secrets の2つを削除した" />
    </template>
  </HandsonStep>

  <HandsonStep
    :step="5"
    title="Wrangler からログアウトする"
    why="PC に残ったログイン情報で、誰でもあなたのアカウントに公開できてしまうため。"
  >
    <p>
      <code>npm run dev</code> がまだ動いていれば <code>Ctrl+C</code>
      で止めてから、ログアウトします。部室の PC など共用の PC
      を使った人は、特に忘れないようにします。
    </p>
    <CodeBlock :code="s.wranglerLogout" />
    <template #expected>
      <p class="text-sm"><code>Successfully logged out.</code> と出れば OK。</p>
    </template>
    <template #check>
      <CheckItem id="h13-logout" label="wrangler logout に成功した" />
    </template>
  </HandsonStep>

  <h2>残してよいもの</h2>
  <ul>
    <li>
      <strong>Cloudflare アカウントと workers.dev のサブドメイン</strong
      >：無料プランなら費用はかかりません。 次に何か公開するときにそのまま使えます
    </li>
    <li><strong>GitHub リポジトリ</strong>：Secrets を消していれば、鍵は残っていません</li>
  </ul>
  <CalloutBox tone="warn" title="有料プランにした人は">
    講座中に Workers の有料プラン（Workers Paid）に切り替えた人は、Worker
    を消しても月額料金がかかり続けます。 ダッシュボードの Billing から解約しておきましょう。
  </CalloutBox>

  <CalloutBox tone="tip" title="お疲れさまでした">
    これで講座で作ったものはすべて片付きました。下のボタンでこのレッスンを完了すると、修了画面に進みます。
  </CalloutBox>
</template>
