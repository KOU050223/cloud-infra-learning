<script setup lang="ts">
import { ref } from "vue";
import CalloutBox from "../components/ui/CalloutBox.vue";

const stories = [
  {
    title: "更新忘れ",
    story: "バグを直して main に push した。でも deploy を忘れていて、本番は1週間バグったまま。",
    lesson: "「push したら公開される」が自動ならこれは起きない",
  },
  {
    title: "属人化",
    story: "デプロイできるのは Cloudflare にログインしている先輩だけ。先輩が旅行中に障害が起きた。",
    lesson: "手順と権限が仕組みに入っていれば、誰でも同じ手順で出せる",
  },
  {
    title: "テスト漏れ",
    story: "急いでいたのでテストを実行せずに deploy。小さな修正のはずが、別の API を壊していた。",
    lesson: "テストに通らない限り公開されない仕組みにすれば、人間のうっかりを止められる",
  },
  {
    title: "環境の違い",
    story: "自分の PC ではデプロイできるのに、後輩の PC だと Node のバージョン違いで失敗する。",
    lesson: "毎回まっさらな同じ環境でビルド・デプロイすれば再現性が上がる",
  },
];
const opened = ref<Set<number>>(new Set());
function toggle(i: number) {
  const n = new Set(opened.value);
  if (n.has(i)) n.delete(i);
  else n.add(i);
  opened.value = n;
}
</script>

<template>
  <p>
    第1回では
    <code>npm run deploy</code>
    を手で実行して公開しました。1人で趣味のアプリを作るならこれで十分です。
    でも、チームで開発して何度も更新していくと……？ よくある失敗談を見てみましょう。
  </p>

  <div class="not-prose my-6 grid grid-cols-2 gap-3">
    <button
      v-for="(st, i) in stories"
      :key="st.title"
      type="button"
      class="rounded-xl border bg-white p-4 text-left text-sm transition hover:border-brand-500"
      :class="opened.has(i) ? 'border-brand-500' : 'border-slate-200'"
      @click="toggle(i)"
    >
      <span class="block font-bold text-slate-900">😱 {{ st.title }}</span>
      <span class="block mt-1 text-slate-600">{{ st.story }}</span>
      <span
        v-if="opened.has(i)"
        class="block mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-900"
      >
        → {{ st.lesson }}
      </span>
      <span v-else class="block mt-3 text-xs text-brand-600">どうすれば防げる？（クリック）</span>
    </button>
  </div>

  <h2>人間に任せず、仕組みに任せる</h2>
  <p>
    これらの問題に共通するのは「人間が毎回正しく手順を守る」ことに頼っている点です。そこで登場するのが
    <strong>CI/CD</strong> です。
  </p>
  <ul>
    <li>
      <strong>CI（Continuous Integration／継続的インテグレーション）</strong
      >：変更のたびに自動でテストやビルドを行い、壊れていないか確かめる
    </li>
    <li>
      <strong>CD（Continuous Delivery / Deployment／継続的デリバリー・デプロイ）</strong
      >：確かめた変更を自動で本番に公開する
    </li>
  </ul>

  <CalloutBox tone="info" title="リリースのたびにビクビクしなくてよくなる">
    CI/CD
    の目的は楽をすることだけではありません。「テストに通ったものだけが出ていく」安心感があるから、小さく頻繁にリリースできるようになります。
  </CalloutBox>
</template>
