<script setup lang="ts">
import PipelineSimulator from "../components/sim/PipelineSimulator.vue";
import CalloutBox from "../components/ui/CalloutBox.vue";
import QuizCard from "../components/ui/QuizCard.vue";
</script>

<template>
  <p>
    CI/CD は「パイプライン」と呼ばれる一連の工程で動きます。変更を push すると、
    <strong>Install（依存のインストール）→ Test（テスト）→ Deploy（公開）</strong
    >が順番に自動実行されます。
  </p>

  <h2>やってみよう</h2>
  <ol>
    <li>まずはテストなし（CDのみ）のまま、「バグ入り」の変更を push してみる</li>
    <li>本番がどうなったか確認したら、「バグを修正」を push して直す</li>
    <li>次に「テスト（CI）を入れる」をオンにして、もう一度「バグ入り」を push してみる</li>
  </ol>

  <PipelineSimulator />

  <CalloutBox tone="tip" title="気づいてほしいこと">
    テストがあるときは、バグ入りの変更が来ても Test
    で止まり、<strong>本番は前のバージョンのまま</strong>守られます。 CI
    は「壊れたものを外に出さないための関所」です。
  </CalloutBox>

  <QuizCard
    question="CI/CD でテストが失敗したとき、本番環境はどうなっている？"
    :options="[
      {
        label: 'バグ入りのバージョンが公開されている',
        explain: 'テストが失敗すると Deploy は実行されません。',
      },
      {
        label: '前回正常にデプロイされたバージョンのまま動いている',
        correct: true,
        explain: 'Deploy まで到達しないので、本番は何も変わりません。直して push し直せばOK。',
      },
      {
        label: '本番環境が停止している',
        explain: 'パイプラインの失敗は本番を止めません。今動いているものはそのままです。',
      },
    ]"
  />
</template>
