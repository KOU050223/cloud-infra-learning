import type { Component } from "vue";

export type LessonKind = "lecture" | "simulator" | "handson" | "wrapup";

export interface Lesson {
  /** URL に使う ID（例: "01"） */
  id: string;
  title: string;
  /** 講座内での時間配分 */
  time: string;
  kind: LessonKind;
  /** 講師が進めるか、各自で進めるか */
  pace: "講師" | "各自" | "講師＋操作" | "全体";
  summary: string;
  component: () => Promise<Component>;
}

export interface Session {
  id: number;
  title: string;
  goal: string;
  deliverable: string;
  lessons: Lesson[];
}

export const kindLabel: Record<LessonKind, string> = {
  lecture: "座学",
  simulator: "シミュレーター",
  handson: "ハンズオン",
  wrapup: "まとめ",
};

export const sessions: Session[] = [
  {
    id: 1,
    title: "第1回 クラウドの全体像と手動デプロイ",
    goal: "クラウドの役割を知り、自分の Hono API を Cloudflare Workers に公開する",
    deliverable: "公開URLからレスポンスが取得できる Hono API",
    lessons: [
      {
        id: "01",
        title: "作ったAPI、誰が使える？",
        time: "0–10分",
        kind: "lecture",
        pace: "講師",
        summary: "localhost と公開環境の違い、インフラ担当の仕事",
        component: () => import("../lessons/L01Localhost.vue"),
      },
      {
        id: "02",
        title: "リクエストの旅",
        time: "10–20分",
        kind: "simulator",
        pace: "各自",
        summary: "URL → DNS → HTTPS → Hono → JSON をステップで追う",
        component: () => import("../lessons/L02RequestJourney.vue"),
      },
      {
        id: "03",
        title: "アプリを支える機能",
        time: "20–35分",
        kind: "simulator",
        pace: "講師＋操作",
        summary: "Compute / DB / Storage / Network / 認証 と、IaaS〜SaaS の提供形態",
        component: () => import("../lessons/L03CloudBuildingBlocks.vue"),
      },
      {
        id: "04",
        title: "クラウドサービス図鑑となぜWorkers？",
        time: "35–45分",
        kind: "lecture",
        pace: "講師",
        summary: "AWS・Google Cloud・Azure・Cloudflare・Vercel の特色と今回の選定理由",
        component: () => import("../lessons/L04Services.vue"),
      },
      {
        id: "05",
        title: "Hono API を手動デプロイ",
        time: "45–80分",
        kind: "handson",
        pace: "各自",
        summary: "ローカルで動かし、Wrangler で Workers に公開する",
        component: () => import("../lessons/L05ManualDeploy.vue"),
      },
      {
        id: "06",
        title: "公開後に必要なこと",
        time: "80–90分",
        kind: "wrapup",
        pace: "全体",
        summary: "無料枠・課金リスク・Secret・ログ",
        component: () => import("../lessons/L06AfterDeploy.vue"),
      },
    ],
  },
  {
    id: 2,
    title: "第2回 CI/CDと安全な更新",
    goal: "Push を起点にテストし、成功したときだけ自動デプロイする",
    deliverable: "テスト成功時だけ Workers へ自動デプロイされるワークフロー",
    lessons: [
      {
        id: "07",
        title: "手動デプロイの課題",
        time: "0–10分",
        kind: "lecture",
        pace: "講師",
        summary: "更新忘れ・属人化・テスト漏れから自動化の必要性を考える",
        component: () => import("../lessons/L07ManualProblems.vue"),
      },
      {
        id: "08",
        title: "CI/CDの仕組み",
        time: "10–25分",
        kind: "simulator",
        pace: "各自",
        summary: "Push → Test → Deploy。不具合があればデプロイを止める",
        component: () => import("../lessons/L08Pipeline.vue"),
      },
      {
        id: "09",
        title: "GitHub Actions の基本",
        time: "25–35分",
        kind: "lecture",
        pace: "講師",
        summary: "Workflow・Trigger・Job/Step・Secrets",
        component: () => import("../lessons/L09Actions.vue"),
      },
      {
        id: "10",
        title: "CI/CD を構築する",
        time: "35–75分",
        kind: "handson",
        pace: "各自",
        summary: "Secrets 設定 → CD → テストを追加して CI/CD",
        component: () => import("../lessons/L10BuildCiCd.vue"),
      },
      {
        id: "11",
        title: "意図的に失敗させる",
        time: "75–85分",
        kind: "handson",
        pace: "各自",
        summary: "テスト失敗 → デプロイが止まる → 修正 → 再公開",
        component: () => import("../lessons/L11BreakIt.vue"),
      },
      {
        id: "12",
        title: "次に学ぶこと",
        time: "85–90分",
        kind: "wrapup",
        pace: "全体",
        summary: "Preview・IaC・監視・SRE・自動レビュー",
        component: () => import("../lessons/L12NextSteps.vue"),
      },
    ],
  },
];

export const allLessons: Lesson[] = sessions.flatMap((s) => s.lessons);

export function findLesson(id: string): Lesson | undefined {
  return allLessons.find((l) => l.id === id);
}

export function neighbors(id: string): { prev?: Lesson; next?: Lesson } {
  const i = allLessons.findIndex((l) => l.id === id);
  if (i < 0) return {};
  return { prev: allLessons[i - 1], next: allLessons[i + 1] };
}
