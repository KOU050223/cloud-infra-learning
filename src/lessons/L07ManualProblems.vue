<script setup lang="ts">
import MangaPanel from "../components/ui/MangaPanel.vue";
import AppIcon from "../components/icons/AppIcon.vue";
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
    title: "確認漏れ",
    story:
      "急いでいたので手元で動かさずに deploy。小さな修正のはずが、打ち間違いで API が 500 エラーに。",
    lesson: "チェックに通らない限り公開されない仕組みにすれば、人間のうっかりを止められる",
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
  <MangaPanel id="m07" />

  <p>
    第1回では
    <code>npm run deploy</code>
    を手で実行して公開しました。1人で趣味のアプリを作るならこれで十分です。
    でも、チームで開発して何度も更新していくと……？ よくある失敗談を見てみましょう。
  </p>

  <div class="not-prose my-12 grid gap-4 md:grid-cols-2">
    <button
      v-for="(st, i) in stories"
      :key="st.title"
      type="button"
      class="group flex flex-col rounded-3xl border-2 bg-white p-7 text-left text-[15px] leading-[1.9] transition hover:-translate-y-0.5 hover:border-brand-300"
      :class="opened.has(i) ? 'border-emerald-400' : 'border-line'"
      @click="toggle(i)"
    >
      <span class="flex items-center gap-3 text-[16px] font-bold">
        <span class="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
          <AppIcon name="alert" :size="20" />
        </span>
        {{ st.title }}
      </span>
      <span class="mt-4 block text-ink/70">{{ st.story }}</span>
      <span
        v-if="opened.has(i)"
        class="rise-in mt-5 flex gap-3 rounded-2xl bg-emerald-50 px-5 py-4 text-emerald-950"
      >
        <AppIcon name="shield" :size="20" class="mt-1 text-emerald-600" />
        {{ st.lesson }}
      </span>
      <span v-else class="mt-5 flex items-center gap-2 text-sm font-bold text-brand-600">
        どうすれば防げる？
        <AppIcon
          name="arrowRight"
          :size="15"
          :stroke="2"
          class="transition group-hover:translate-x-1"
        />
      </span>
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
    の目的は楽をすることだけではありません。「チェックに通ったものだけが出ていく」安心感があるから、小さく頻繁にリリースできるようになります。
  </CalloutBox>
</template>
