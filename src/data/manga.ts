/**
 * レッスンの要所に挟む1コマ漫画。
 * 絵（public/manga/）には文字を入れず、台詞はここに書いてサイト側で吹き出しとして重ねる。
 */
export type Speaker = "kaniko" | "ritaneko";

export const speakers: Record<Speaker, { name: string; avatar: string }> = {
  kaniko: { name: "かに子", avatar: "/manga/avatar-kaniko.png" },
  ritaneko: { name: "リタ猫先輩", avatar: "/manga/avatar-ritaneko.png" },
};

export interface MangaLine {
  who: Speaker;
  text: string;
  /** 吹き出しを置く側（絵の中の立ち位置に合わせる） */
  side: "left" | "right";
}

export interface MangaPanelDef {
  src: string;
  /** 絵の説明（読み上げ用） */
  alt: string;
  lines: MangaLine[];
}

export const manga = {
  m01: {
    src: "/manga/m01-localhost.jpg",
    alt: "かに子がノートPCを見せながら URL を送り、リタ猫先輩はエラーの出たスマホを見て首をかしげている",
    lines: [
      { who: "kaniko", side: "left", text: "先輩！ HP できたので URL 送りました！" },
      { who: "ritaneko", side: "right", text: "……開けないにゃ。これ、どこのアドレスにゃ？" },
    ],
  },
  m02: {
    src: "/manga/m02-journey.jpg",
    alt: "リタ猫先輩がホワイトボードの図を指して説明し、かに子がメモを取っている",
    lines: [
      {
        who: "ritaneko",
        side: "left",
        text: "URL を入れてから返事が来るまで、いくつもの場所を通るにゃ",
      },
      { who: "kaniko", side: "right", text: "リクエストも旅をしてるんですね……！" },
    ],
  },
  m03: {
    src: "/manga/m04-clouds.jpg",
    alt: "たくさんのクラウドのカードに囲まれてかに子が混乱し、リタ猫先輩が1枚を指さしている",
    lines: [
      { who: "kaniko", side: "left", text: "クラウドって、こんなにあるんですか！？" },
      { who: "ritaneko", side: "right", text: "名前より先に、何をしたいかから考えるにゃ" },
    ],
  },
  m05: {
    src: "/manga/m05-published.jpg",
    alt: "公開に成功し、かに子がスマホを掲げて喜び、リタ猫先輩も手を上げている",
    lines: [
      { who: "ritaneko", side: "left", text: "公開おめでとうにゃ。ここからが本番にゃ" },
      { who: "kaniko", side: "right", text: "先輩のスマホでも開けました！" },
    ],
  },
  m06: {
    src: "/manga/m06-bill.jpg",
    alt: "高額の請求を想像して青ざめるかに子に、リタ猫先輩が落ち着いて貯金箱を差し出している",
    lines: [
      { who: "kaniko", side: "left", text: "アクセスが増えたら、すごい請求が来たり……！？" },
      { who: "ritaneko", side: "right", text: "落ち着くにゃ。まずは無料枠と上限を確かめるにゃ" },
    ],
  },
  m07: {
    src: "/manga/m07-forgot.jpg",
    alt: "コードを直したのに古いままの HP を見て慌てるかに子を、リタ猫先輩がのぞき込んでいる",
    lines: [
      { who: "kaniko", side: "left", text: "直したのに、HP が古いままです……！" },
      { who: "ritaneko", side: "right", text: "npm run deploy、忘れてないかにゃ？" },
    ],
  },
  m11: {
    src: "/manga/m11-guarded.jpg",
    alt: "パイプラインが途中で止まった画面を見て、かに子が安心し、リタ猫先輩が親指を立てている",
    lines: [
      { who: "kaniko", side: "left", text: "打ち間違い、本番に出る前に止まってた……！" },
      { who: "ritaneko", side: "right", text: "仕組みが守ってくれたにゃ" },
    ],
  },
  m12: {
    src: "/manga/m12-clear.jpg",
    alt: "夕焼けの部室で、かに子とリタ猫先輩がハイタッチしている",
    lines: [
      { who: "kaniko", side: "left", text: "HP、みんなで安全に更新できるようになりました！" },
      { who: "ritaneko", side: "right", text: "よくがんばったにゃ。次は何を学ぶにゃ？" },
    ],
  },
} satisfies Record<string, MangaPanelDef>;

export type MangaId = keyof typeof manga;
