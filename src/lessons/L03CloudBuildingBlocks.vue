<script setup lang="ts">
import MangaPanel from "../components/ui/MangaPanel.vue";
import Term from "../components/ui/Term.vue";
import BuildingBlocks from "../components/sim/BuildingBlocks.vue";
import ServiceModels from "../components/sim/ServiceModels.vue";
import CalloutBox from "../components/ui/CalloutBox.vue";
import QuizCard from "../components/ui/QuizCard.vue";
</script>

<template>
  <MangaPanel id="m03" />

  <p>
    クラウドのサービスは数百種類ありますが、役割で分けるとほんの数種類です。サービス名を覚えるより先に、
    「<strong>何を作りたい → どんな機能が必要 → どんなサービスがある</strong
    >」の順で考えられるようになりましょう。
  </p>

  <h2>アプリを支える5つの機能</h2>
  <p>それぞれのカードをクリックして、役割と代表的なサービスを見てみましょう。</p>
  <BuildingBlocks />

  <CalloutBox tone="tip" title="今回の講座で使うのは？">
    今回は DB を使わない API なので、使うのは <strong>Compute（Workers）</strong> と
    <strong>Network（Cloudflare の DNS・<Term id="cdn">CDN</Term>）</strong>
    だけ。必要な機能が少ないほど、構成はシンプルになります。
  </CalloutBox>

  <h2>クラウドの提供形態</h2>
  <p>
    クラウドは「どこまで事業者に任せるか」でも分類できます。ボタンを切り替えて、自分が管理する範囲（黄色）がどう変わるか見てみましょう。
  </p>
  <ServiceModels />

  <CalloutBox tone="info" title="分類はきっちり分かれるわけではない">
    たとえば Cloudflare Workers は FaaS ですが、<Term id="d1">D1</Term> や
    <Term id="r2">R2</Term> と組み合わせると BaaS のようにも使えます。 Firebase は BaaS
    ですが、Cloud Functions という FaaS も含みます。分類は「だいたいの目安」として使いましょう。
  </CalloutBox>

  <QuizCard
    question="「サーバーのOSのセキュリティ更新を自分でやらなくてよい」のはどれ？"
    :options="[
      {
        label: 'IaaS（例：AWS EC2）',
        explain: 'IaaS では仮想マシンの OS から上は利用者の責任です。OS の更新も自分で行います。',
      },
      {
        label: 'FaaS（例：Cloudflare Workers）',
        correct: true,
        explain:
          'FaaS は OS やランタイムを事業者が管理します。利用者はコードとデータに集中できます。',
      },
      { label: 'オンプレミス', explain: 'オンプレミスではハードウェアから全部自分で管理します。' },
    ]"
  />
</template>
