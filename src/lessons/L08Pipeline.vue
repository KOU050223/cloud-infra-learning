<script setup lang="ts">
import PipelineSimulator from "../components/sim/PipelineSimulator.vue";
import CalloutBox from "../components/ui/CalloutBox.vue";
import QuizCard from "../components/ui/QuizCard.vue";
</script>

<template>
  <p>
    CI/CD は「パイプライン」と呼ばれる一連の工程で動きます。変更を push すると、
    <strong>Install（依存のインストール）→ Build（型チェック）→ Deploy（公開）</strong
    >が順番に自動実行されます。
  </p>

  <h2>やってみよう</h2>
  <ol>
    <li>まずは build チェックなし（CD のみ）のまま、「型エラー」の変更を push してみる</li>
    <li>本番がどうなったか確認したら、「元に戻す」を push して直す</li>
    <li>
      次に「build チェック（CI）を入れる」をオンにして、もう一度「型エラー」の変更を push してみる
    </li>
    <li>最後に、CI を入れたまま「動作の不具合」の変更を push してみる</li>
  </ol>

  <PipelineSimulator />

  <CalloutBox tone="tip" title="気づいてほしいこと">
    build チェックがあるときは、型エラーの変更が来ても Build
    で止まり、<strong>本番は前のバージョンのまま</strong>守られます。CI
    は「壊れたものを外に出さないための関所」です。 ただし「動作の不具合」は build
    を通ってしまいます。何を止められて、何を止められないかを知っておくことが大切です。
  </CalloutBox>

  <QuizCard
    question="CI/CD で build（型チェック）が失敗したとき、本番環境はどうなっている？"
    :options="[
      {
        label: '型エラー入りのバージョンが公開されている',
        explain: 'build が失敗すると Deploy は実行されません。',
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

  <QuizCard
    question="あいさつを Hello から Hi に変えてしまった（型は正しい）。build チェックだけの CI では？"
    :options="[
      {
        label: 'build で止まり、公開されない',
        explain: 'コードとしては正しいので、型チェックは通ります。',
      },
      {
        label: 'build を通過して公開されてしまう',
        correct: true,
        explain:
          'build が見るのは「コードとして壊れていないか」だけ。仕様どおりに動くかを確かめるにはテストが必要です。',
      },
    ]"
  />
</template>
