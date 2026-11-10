<script setup lang="ts">
import PrereqBox from "../components/ui/PrereqBox.vue";
import Term from "../components/ui/Term.vue";
import DashLink from "../components/ui/DashLink.vue";
import AppIcon from "../components/icons/AppIcon.vue";
import { computed, ref } from "vue";
import CalloutBox from "../components/ui/CalloutBox.vue";
import CodeBlock from "../components/ui/CodeBlock.vue";
import { workflowCdOnly } from "../data/snippets";

const terms = [
  {
    id: "workflow",
    name: "Workflow",
    desc: "自動化したい処理全体。.github/workflows/ に YAML ファイルとして置く。",
    lines: [1, 1],
  },
  {
    id: "trigger",
    name: "Trigger (on)",
    desc: "いつ動かすか。この例では main ブランチに push されたとき。",
    lines: [3, 5],
  },
  {
    id: "job",
    name: "Job",
    desc: "まとまった処理の単位。それぞれ新しい仮想マシン（runs-on）上で動く。",
    lines: [7, 9],
  },
  {
    id: "step",
    name: "Step",
    desc: "Job の中で上から順に実行される1つ1つの手順。uses は既製のアクション、run はコマンド。",
    lines: [10, 18],
  },
  {
    id: "secrets",
    name: "Secrets",
    desc: "API トークンなど秘密の値。GitHub に暗号化して保存し、${{ secrets.名前 }} で参照する。",
    lines: [19, 20],
  },
] as const;

const active = ref<string>("trigger");
const activeTerm = computed(() => terms.find((t) => t.id === active.value)!);
const lines = workflowCdOnly.split("\n");
</script>

<template>
  <p>
    今回 CI/CD を動かすのは <strong>GitHub Actions</strong> です。GitHub のリポジトリに YAML
    ファイルを置くだけで、push などをきっかけに GitHub
    が用意した仮想マシンで処理を実行してくれます。
  </p>

  <h2>ワークフローを読んでみよう</h2>
  <PrereqBox title="YAML の読み方">
    <p>ワークフローは YAML という形式で書きます。読むときに押さえるのは次の3つだけです。</p>
    <ul>
      <li><code>名前: 値</code> で1つの設定を表す（例：<code>runs-on: ubuntu-latest</code>）</li>
      <li>
        字下げ（スペース2つ）が「中に入っている」ことを表す。<code>jobs:</code>
        の下で字下げされた行は、すべて jobs の中身
      </li>
      <li>
        行頭の <code>- </code> は並びの1項目を表す。<code>steps:</code> の下の
        <code>- </code> が、上から順に実行される手順
      </li>
    </ul>
    <p>タブ文字は使えず、字下げがずれるとワークフローが読み込めなくなります。</p>
  </PrereqBox>
  <p>用語をクリックすると、YAML の該当部分が光ります。</p>

  <div class="not-prose my-6 grid grid-cols-[200px_1fr] gap-4">
    <div class="space-y-1.5">
      <button
        v-for="t in terms"
        :key="t.id"
        type="button"
        class="w-full rounded-lg border px-3 py-2 text-left text-sm font-semibold transition"
        :class="
          active === t.id
            ? 'border-brand-500 bg-brand-50 text-brand-700'
            : 'border-slate-200 bg-white hover:border-slate-300'
        "
        @click="active = t.id"
      >
        {{ t.name }}
      </button>
      <p class="rounded-lg bg-slate-50 p-3 text-sm">{{ activeTerm.desc }}</p>
    </div>
    <pre
      class="overflow-x-auto rounded-lg bg-slate-900 py-3 font-mono text-[13px] leading-relaxed text-slate-300"
    ><code><span
      v-for="(l, i) in lines"
      :key="i"
      class="block px-4 transition-colors"
      :class="i + 1 >= activeTerm.lines[0] && i + 1 <= activeTerm.lines[1] ? 'bg-amber-400/20 text-amber-100' : ''"
    >{{ l || " " }}</span></code></pre>
  </div>

  <h2>成功と失敗</h2>
  <p>
    Step のどれかが失敗（終了コードが 0 以外）すると、その Job は失敗し、以降の Step
    は実行されません。 結果はリポジトリの <strong>Actions タブ</strong>に 成功
    <AppIcon name="checkCircle" :size="18" class="inline align-[-0.25em] text-emerald-600" /> / 失敗
    <AppIcon name="crossCircle" :size="18" class="inline align-[-0.25em] text-rose-600" />
    で表示され、ログも見られます。
  </p>

  <CalloutBox tone="warn" title="Secrets はどこに置く？">
    Cloudflare の <Term id="apiToken">API トークン</Term>は、GitHub リポジトリの
    <strong>Settings → Secrets and variables → Actions</strong>
    に登録します。ログに表示されても自動で <code>***</code> に伏せられます。YAML
    に直接書いてはいけません。
    <DashLink
      brand="github"
      repo-page="secrets"
      :path="['Settings', 'Secrets and variables', 'Actions']"
    />
  </CalloutBox>

  <CodeBlock :code="workflowCdOnly" title=".github/workflows/deploy.yml" />
</template>
