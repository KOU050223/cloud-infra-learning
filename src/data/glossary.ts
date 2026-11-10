/**
 * 用語の辞書。レッスンでは <Term id="cdn">CDN</Term> や、文字列中の [[cdn|CDN]] で参照する。
 * 用語集ページもここから作る。
 */
export interface GlossaryEntry {
  /** 見出し（正式名） */
  term: string;
  /** 1〜3文の説明 */
  desc: string;
  /** 関係が深いレッスン */
  lesson?: string;
}

export const glossary = {
  ip: {
    term: "IP アドレス",
    desc: "ネットワーク上の機器を見分けるための番号（例：104.21.x.x）。住所のようなもので、通信相手はこの番号で探す。",
    lesson: "02",
  },
  edge: {
    term: "エッジ",
    desc: "ユーザーの近くに置かれたサーバー（拠点）。Cloudflare は世界中にエッジを持ち、Workers はそこでコードを動かす。",
    lesson: "02",
  },
  cdn: {
    term: "CDN（Content Delivery Network）",
    desc: "画像などのコピーを世界中の拠点に置き、ユーザーの近くから返して速く表示する仕組み。エッジと同じ考え方。",
    lesson: "02",
  },
  authn: {
    term: "認証",
    desc: "「あなたは誰か」を確かめること。ログインがこれにあたる。",
    lesson: "03",
  },
  authz: {
    term: "認可",
    desc: "認証で確かめた相手に「何をしてよいか」を決めること。例：自分の投稿だけは削除できる。",
    lesson: "03",
  },
  runtime: {
    term: "ランタイム",
    desc: "プログラムを動かすための実行環境。JavaScript なら Node.js や、Workers 独自の実行環境がこれにあたる。",
    lesson: "03",
  },
  serverless: {
    term: "サーバーレス",
    desc: "サーバーの用意や管理を事業者に任せ、リクエストが来たときだけ動く方式。サーバーが存在しないわけではない。",
    lesson: "03",
  },
  d1: {
    term: "D1",
    desc: "Cloudflare のデータベース。中身は SQLite で、Workers からそのまま読み書きできる。",
    lesson: "04",
  },
  r2: {
    term: "R2",
    desc: "Cloudflare のストレージ。画像や動画などのファイルを置く。AWS の S3 と同じ種類のサービス。",
    lesson: "04",
  },
  payg: {
    term: "従量課金",
    desc: "使った量に応じて料金が決まる方式。アクセスが急に増えると、請求額もそのぶん増える。",
    lesson: "06",
  },
  env: {
    term: "環境変数",
    desc: "プログラムの外から渡す設定値。API キーなどの秘密の値や、環境ごとに変わる値をコードに書かずに渡せる。",
    lesson: "06",
  },
  apiToken: {
    term: "API トークン",
    desc: "人がログインする代わりに、プログラムがサービスを操作するための鍵。持っていれば誰でもその権限で操作できるので、パスワードと同じように扱う。",
    lesson: "10",
  },
  npmCi: {
    term: "npm ci",
    desc: "package-lock.json に書かれたバージョンどおりに、依存パッケージを入れ直すコマンド。lock ファイルを書き換えないので、CI で毎回同じ環境を作るのに使う。",
    lesson: "10",
  },
  pr: {
    term: "Pull Request",
    desc: "変更を main ブランチに取り込む前に、レビューや CI の確認を受けるための GitHub の仕組み。",
    lesson: "10",
  },
} satisfies Record<string, GlossaryEntry>;

export type GlossaryId = keyof typeof glossary;

export function isGlossaryId(id: string): id is GlossaryId {
  return id in glossary;
}

export type TermPart = { text: string } | { id: GlossaryId; text: string };

/**
 * 「世界中の [[edge|エッジ]] で」のような文字列を、地の文と用語に分ける。
 * 辞書にない id は地の文として残す。
 */
export function parseTermText(src: string): TermPart[] {
  const parts: TermPart[] = [];
  const re = /\[\[([A-Za-z][A-Za-z0-9]*)(?:\|([^\]]+))?\]\]/g;
  let last = 0;
  for (const m of src.matchAll(re)) {
    if (m.index > last) parts.push({ text: src.slice(last, m.index) });
    const id = m[1]!;
    const label = m[2];
    if (isGlossaryId(id)) parts.push({ id, text: label ?? glossary[id].term });
    else parts.push({ text: label ?? id });
    last = m.index + m[0].length;
  }
  if (last < src.length) parts.push({ text: src.slice(last) });
  return parts;
}
