<script setup lang="ts">
import MangaPanel from "../components/ui/MangaPanel.vue";
import AppIcon from "../components/icons/AppIcon.vue";
import BrandIcon from "../components/icons/BrandIcon.vue";
import type { BrandName } from "../components/icons/brands";
import type { IconName } from "../components/icons/icons";
import CalloutBox from "../components/ui/CalloutBox.vue";

const topics: { icon: IconName; name: string; desc: string; brands: BrandName[] }[] = [
  {
    icon: "flask",
    brands: ["vitest"],
    name: "自動テスト",
    desc: "build では止められない「動作の不具合」を、期待する結果を書いたテストで止める。L10 の発展パートが入り口。",
  },
  {
    icon: "eye",
    brands: ["vercel", "cloudflare"],
    name: "Preview デプロイ",
    desc: "Pull Request ごとに確認用の URL を自動で発行し、マージ前に動作を見られる。Vercel や Workers の Preview URL など。",
  },
  {
    icon: "codeDoc",
    brands: ["terraform"],
    name: "IaC（Infrastructure as Code）",
    desc: "インフラの構成をコードで管理する。Terraform など。誰が作っても同じ環境になり、変更履歴も残る。",
  },
  {
    icon: "robot",
    brands: ["githubactions"],
    name: "自動レビュー",
    desc: "Lint・型チェック・AI レビューを CI に組み込み、レビューの負担を減らす。",
  },
  {
    icon: "chart",
    brands: ["sentry", "grafana"],
    name: "監視",
    desc: "エラー率・レスポンス時間を可視化し、異常があれば通知する。Sentry、Grafana など。",
  },
  {
    icon: "pulse",
    brands: [],
    name: "SRE",
    desc: "信頼性をエンジニアリングで高める考え方。SLO（目標とする信頼性）を決め、障害から学び、運用作業を自動化する。",
  },
];

const animeishi = {
  repo: "https://github.com/KOU050223/animeishi",
  pr: "https://github.com/KOU050223/animeishi/pull/627",
  workflows: "https://github.com/KOU050223/animeishi/tree/main/.github/workflows",
};

const workflows = [
  {
    name: "CI",
    does: "Test・Lint & Type Check・Format Check・Migration Check（DB の変更手順が壊れていないか）を並列で実行する。",
    link: "第2回の build チェックを細かく分けたもの",
  },
  {
    name: "Bundle Check",
    does: "Web・iOS・Android の3環境それぞれで、アプリのコードを1つにまとめられるかを確かめる。",
    link: "matrix で同じ Job を条件違いで3回動かす",
  },
  {
    name: "Preview Web / API",
    does: "PR ごとに Workers の Preview URL を発行し、URL を PR にコメントする。",
    link: "Preview デプロイ",
  },
  {
    name: "React Doctor",
    does: "React のコードによくある問題を検出し、結果を PR にコメントする。",
    link: "自動レビュー",
  },
  {
    name: "CodeRabbit",
    does: "AI が差分を読んでレビューコメントを付ける（GitHub Actions ではなく GitHub App）。",
    link: "自動レビュー",
  },
];

const figures = [
  {
    src: "/examples/animeishi/pr-checks.webp",
    alt: "animeishi の PR #627 の Checks タブ。coderabbitai、Preview API、CI、React Doctor、Preview Web、Bundle Check が並んでいる",
    caption: "PR #627 の Checks タブ。PR を出すと、これらのワークフローがすべて自動で走る",
    href: `${animeishi.pr}/checks`,
  },
  {
    src: "/examples/animeishi/ci-run.webp",
    alt: "CI ワークフローの実行結果。Test 1分25秒、Lint & Type Check 41秒、Format Check 34秒、Migration Check 5秒がすべて成功している",
    caption: "CI ワークフローの実行結果。4つの Job が並列に走り、全体で約1分半で終わる",
    href: "https://github.com/KOU050223/animeishi/actions/runs/44465584772",
  },
  {
    src: "/examples/animeishi/preview-comment.webp",
    alt: "github-actions bot の PR コメント。Web と API の Preview URL、Alias pr-627、Commit が書かれている",
    caption: "Preview Web が PR に残すコメント。レビューする人はこの URL を開いて動作を確認できる",
    href: animeishi.pr,
  },
];
</script>

<template>
  <MangaPanel id="m12" />

  <p>
    お疲れさまでした！
    最後に、この先の学びにつながる分野を紹介します。今日の講座は、どれも入り口に立ったところです。
  </p>

  <div class="not-prose my-12 grid gap-4 md:grid-cols-2">
    <div
      v-for="t in topics"
      :key="t.name"
      class="rounded-3xl bg-white p-7 shadow-[0_0_0_1px_var(--color-line)]"
    >
      <div class="flex items-center gap-3 text-[16px] font-bold">
        <span
          class="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"
        >
          <AppIcon :name="t.icon" :size="20" />
        </span>
        {{ t.name }}
        <span class="ml-auto flex gap-1.5">
          <span
            v-for="b in t.brands"
            :key="b"
            class="flex size-8 items-center justify-center rounded-lg bg-ink/[0.04]"
          >
            <BrandIcon :name="b" :size="16" />
          </span>
        </span>
      </div>
      <p class="mt-4 text-[15px] leading-[1.9] text-ink/65">{{ t.desc }}</p>
    </div>
  </div>

  <h2>実例：animeishi の CI/CD</h2>
  <p>
    上の分野が実際の開発でどう組み合わさるのかを、講師が普段開発している
    <a :href="animeishi.repo" target="_blank" rel="noopener noreferrer">animeishi</a>
    （アニメの視聴履歴で名刺を作るアプリ）のリポジトリで見てみます。Pull Request
    を出すと、次のチェックが自動で走ります。
  </p>

  <figure v-for="f in figures.slice(0, 1)" :key="f.src" class="not-prose my-8">
    <a :href="f.href" target="_blank" rel="noopener noreferrer">
      <img
        :src="f.src"
        :alt="f.alt"
        loading="lazy"
        class="w-full rounded-2xl shadow-[0_0_0_1px_var(--color-line)]"
      />
    </a>
    <figcaption class="mt-3 text-center text-[13px] text-ink/55">{{ f.caption }}</figcaption>
  </figure>

  <div class="not-prose my-8 overflow-x-auto">
    <table class="w-full min-w-[560px] text-left text-[14px] leading-[1.8]">
      <thead>
        <tr class="border-b border-line text-ink/55">
          <th class="py-2 pr-4 font-semibold">ワークフロー</th>
          <th class="py-2 pr-4 font-semibold">やっていること</th>
          <th class="py-2 font-semibold">講座との対応</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="w in workflows" :key="w.name" class="border-b border-line/60 align-top">
          <td class="py-3 pr-4 font-mono text-[13px] font-semibold whitespace-nowrap">
            {{ w.name }}
          </td>
          <td class="py-3 pr-4">{{ w.does }}</td>
          <td class="py-3 text-ink/65">{{ w.link }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <p>
    CI ワークフローの中身は、第2回で作った build Job と同じ形です。Job を4つに分けて並列に走らせ、
    どれが落ちたのかがひと目で分かるようにしています。
  </p>
  <template v-for="(f, i) in figures.slice(1)" :key="f.src">
    <p v-if="i === 1">
      Preview Web / API は、PR の変更を本番とは別の URL にデプロイし、その URL を bot
      がコメントします。レビューする人はマージ前に実際の画面を触って確かめられます。
    </p>
    <figure class="not-prose my-8">
      <a :href="f.href" target="_blank" rel="noopener noreferrer">
        <img
          :src="f.src"
          :alt="f.alt"
          loading="lazy"
          class="w-full rounded-2xl shadow-[0_0_0_1px_var(--color-line)]"
        />
      </a>
      <figcaption class="mt-3 text-center text-[13px] text-ink/55">{{ f.caption }}</figcaption>
    </figure>
  </template>

  <p>
    すべてのチェックが通ったら main にマージし、main への push をきっかけに
    <code>Deploy Web</code> / <code>Deploy API</code> が本番の Workers
    へデプロイします。ここは第2回で作った CD とまったく同じ仕組みです。
    どのワークフローも、使っている部品は <code>on</code> / <code>jobs</code> / <code>steps</code> /
    <code>secrets</code> だけです。
    <a :href="animeishi.workflows" target="_blank" rel="noopener noreferrer">.github/workflows/</a>
    の YAML は公開しているので、読んでみてください。
  </p>

  <h2>おすすめの学び方</h2>
  <ul>
    <li>
      <BrandIcon name="youtube" :size="18" class="mr-1.5 inline align-[-0.2em]" />YouTube：<a
        href="https://www.youtube.com/@engineer_ryoma"
        target="_blank"
        rel="noopener noreferrer"
        >りょうま@インフラ攻略</a
      >、
      <a href="https://youtu.be/KWMFakwvSxE" target="_blank" rel="noopener noreferrer"
        >【最短】インフラエンジニア→SRE 完全ロードマップ</a
      >
    </li>
    <li>自分のアプリに DB（D1）を足して、マイグレーションまで CI/CD に入れてみる</li>
    <li>
      物理的な機材（ラズパイなど）でサーバーを立てると、クラウドが何を肩代わりしてくれているかが実感できる
    </li>
  </ul>

  <h2>この講座で持ち帰ってほしいこと</h2>
  <ol>
    <li><strong>デプロイ先から逆算して技術選定をする</strong></li>
    <li><strong>作って終わりではなく「サービスを提供し続ける」意識を持つ</strong></li>
    <li>
      <strong>インフラは成果が目に見えにくいけれど大事な仕事</strong
      >。支えてくれる人を労ってあげよう
    </li>
  </ol>

  <CalloutBox tone="warn" title="まだ終わりではありません">
    最後に、講座で作った Cloudflare のリソースを片付けます。次のレッスンに進みましょう。
  </CalloutBox>
</template>
