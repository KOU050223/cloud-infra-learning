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
  /** 物語：レッスン冒頭の依頼カードに出す場面とゴール */
  mission: { scene: string; goal: string };
  /** ターミナルのシミュレーターを出すか（コマンドを試すレッスン） */
  terminal?: boolean;
  component: () => Promise<Component>;
}

export interface Session {
  id: number;
  title: string;
  /** 物語での章タイトルと、その回の状況 */
  chapter: { title: string; scene: string };
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
    chapter: {
      title: "部の HP を、世界に公開する",
      scene:
        "情報技術研究部の HP が新しくなった。画面は完成していて、かに子の担当はデータを返す API。ところが API は、まだかに子の PC の中でしか動いていない。",
    },
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
        mission: {
          scene:
            "かに子は、部の HP にデータを返す API を作り終えた。リタ猫先輩「できたなら見せてほしいにゃ」。かに子の PC では http://localhost:8787 を開けば JSON が返ってくる。この URL をそのまま送れば、先輩にも見てもらえるだろうか。",
          goal: "自分の PC の中と、インターネットに公開された場所の違いを説明できる",
        },
        component: () => import("../lessons/L01Localhost.vue"),
      },
      {
        id: "02",
        title: "リクエストの旅",
        time: "10–20分",
        kind: "simulator",
        pace: "各自",
        summary: "URL → DNS → HTTPS → Hono → JSON をステップで追う",
        mission: {
          scene:
            "先輩のスマホから HP を開くと、API へのリクエストはどこを通って届くのか。公開する前に、リタ猫先輩と一緒にその道筋を確かめる。",
          goal: "URL を入れてから JSON が返るまでの流れ（DNS・HTTPS・エッジ・ルーティング）を追える",
        },
        component: () => import("../lessons/L02RequestJourney.vue"),
      },
      {
        id: "03",
        title: "アプリを支える機能",
        time: "20–35分",
        kind: "simulator",
        pace: "講師＋操作",
        summary: "Compute / DB / Storage / Network / 認証 と、IaaS〜SaaS の提供形態",
        mission: {
          scene:
            "リタ猫先輩「お知らせも活動写真も載せたいし、部員だけが編集できるようにもしたいにゃ」。やりたいことが増えてきたので、クラウドのどの機能で実現できるかを整理する。",
          goal: "HP に必要な機能を、Compute・DB・Storage・Network・Identity に分けて考えられる",
        },
        component: () => import("../lessons/L03CloudBuildingBlocks.vue"),
      },
      {
        id: "04",
        title: "クラウドサービス図鑑となぜWorkers？",
        time: "35–45分",
        kind: "lecture",
        pace: "講師",
        summary: "AWS・Google Cloud・Azure・Cloudflare・Vercel の特色と今回の選定理由",
        mission: {
          scene:
            "部費からサーバー代は出せない。かに子は、無料で始められて、作った Hono API がそのまま動く公開先を探す。",
          goal: "主要なクラウドの特色を知り、今回 Cloudflare Workers を選ぶ理由を説明できる",
        },
        component: () => import("../lessons/L04Services.vue"),
      },
      {
        id: "05",
        terminal: true,
        title: "Hono API を手動デプロイ",
        time: "45–80分",
        kind: "handson",
        pace: "各自",
        summary: "ローカルで動かし、Wrangler で Workers に公開する",
        mission: {
          scene:
            "いよいよ公開する。部のグループチャットに URL を貼って、リタ猫先輩のスマホから開いてもらうところまでやる。",
          goal: "自分の API を Workers に公開し、公開 URL から応答を確かめる",
        },
        component: () => import("../lessons/L05ManualDeploy.vue"),
      },
      {
        id: "06",
        terminal: true,
        title: "公開後に必要なこと",
        time: "80–90分",
        kind: "wrapup",
        pace: "全体",
        summary: "無料枠・課金リスク・Secret・ログ",
        mission: {
          scene:
            "公開できた。かに子「アクセスが増えたら、部費から請求されたりしませんか……？」。公開したあとに気をつけることを押さえる。",
          goal: "無料枠と課金・Secret・ログの扱いを説明できる",
        },
        component: () => import("../lessons/L06AfterDeploy.vue"),
      },
    ],
  },
  {
    id: 2,
    chapter: {
      title: "部員みんなで、HP を安全に更新する",
      scene:
        "新歓に向けて、HP の更新を部員みんなで分担することになった。人が増えるほど、うっかり壊したまま公開してしまう危険も増える。",
    },
    title: "第2回 CI/CDと安全な更新",
    goal: "Push を起点に build チェックし、成功したときだけ自動デプロイする",
    deliverable: "build チェック成功時だけ Workers へ自動デプロイされるワークフロー",
    lessons: [
      {
        id: "07",
        title: "手動デプロイの課題",
        time: "0–10分",
        kind: "lecture",
        pace: "講師",
        summary: "更新忘れ・属人化・確認漏れから自動化の必要性を考える",
        mission: {
          scene:
            "新歓に向けて、HP の更新をかに子が任されることになった。ところが「直したのに HP が古いまま」「先輩がいないと公開できない」と問題が続く。",
          goal: "手で公開する運用の問題点を挙げ、自動化が必要な理由を説明できる",
        },
        component: () => import("../lessons/L07ManualProblems.vue"),
      },
      {
        id: "08",
        title: "CI/CDの仕組み",
        time: "10–25分",
        kind: "simulator",
        pace: "各自",
        summary: "Push → Build → Deploy。壊れていればデプロイを止める",
        mission: {
          scene:
            "「push したら、確認してから自動で公開される」仕組みを作る前に、シミュレーターで動きを確かめる。",
          goal: "build チェックが失敗するとデプロイが止まり、本番が守られる流れを説明できる",
        },
        component: () => import("../lessons/L08Pipeline.vue"),
      },
      {
        id: "09",
        title: "GitHub Actions の基本",
        time: "25–35分",
        kind: "lecture",
        pace: "講師",
        summary: "Workflow・Trigger・Job/Step・Secrets",
        mission: {
          scene:
            "自動化には GitHub Actions を使う。設定ファイルを読めるようになれば、来年の新入部員に引き継ぐときにも説明できる。",
          goal: "ワークフローの Workflow・Trigger・Job・Step・Secrets を読み分けられる",
        },
        component: () => import("../lessons/L09Actions.vue"),
      },
      {
        id: "10",
        terminal: true,
        title: "CI/CD を構築する",
        time: "35–75分",
        kind: "handson",
        pace: "各自",
        summary: "Secrets 設定 → CD → build チェックを追加して CI/CD",
        mission: {
          scene: "部の HP の API のリポジトリに、自動で公開する仕組みを組み込む。",
          goal: "build に通ったときだけ自動で公開されるワークフローを動かす",
        },
        component: () => import("../lessons/L10BuildCiCd.vue"),
      },
      {
        id: "11",
        terminal: true,
        title: "意図的に失敗させる",
        time: "75–83分",
        kind: "handson",
        pace: "各自",
        summary: "build 失敗 → デプロイが止まる → 修正 → 再公開",
        mission: {
          scene:
            "新歓の前日、かに子は打ち間違いを含んだ変更を push してしまった。作った仕組みが HP を守れるか、わざと壊して確かめる。",
          goal: "build が失敗するとデプロイが止まり、直して push すれば再び公開されることを確かめる",
        },
        component: () => import("../lessons/L11BreakIt.vue"),
      },
      {
        id: "12",
        title: "次に学ぶこと",
        time: "83–86分",
        kind: "wrapup",
        pace: "全体",
        summary: "Preview・IaC・監視・SRE・自動レビュー",
        mission: {
          scene:
            "HP は公開され、部員みんなで安全に更新できるようになった。リタ猫先輩と一緒に、この先学べることを見ていく。",
          goal: "次に学ぶ分野（Preview・IaC・監視・テストなど）の役割を知る",
        },
        component: () => import("../lessons/L12NextSteps.vue"),
      },
      {
        id: "13",
        terminal: true,
        title: "後片付け",
        time: "86–90分",
        kind: "handson",
        pace: "各自",
        summary: "自動デプロイを止め、Worker・API トークン・Secrets を削除する",
        mission: {
          scene:
            "部の HP は、部の共用アカウントで公開し直すことになった。リタ猫先輩「練習で作ったものは、自分で片付けるまでがインフラの仕事にゃ」。かに子の個人アカウントに残ったものを、すべて落とす。",
          goal: "講座で作った Cloudflare のリソースと鍵を、漏れなく削除できる",
        },
        component: () => import("../lessons/L13Cleanup.vue"),
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
