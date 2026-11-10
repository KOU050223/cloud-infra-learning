import { describe, expect, it } from "vite-plus/test";
import {
  complete,
  isRunnable,
  presets,
  PROD_HOST,
  run,
  suggest,
  tokenize,
  type ShellState,
} from "./shell";

/** 複数のコマンドを順に実行して、最後の結果を返す */
function runAll(state: ShellState, ...cmds: string[]) {
  let s = state;
  let last = run(s, "");
  for (const c of cmds) {
    last = run(s, c);
    s = last.state;
  }
  return { ...last, text: last.lines.map((l) => l.text).join("\n") };
}

const ready = () =>
  runAll(presets.fresh(), "git clone https://github.com/x/t.git my-api", "cd my-api", "npm install")
    .state;

describe("tokenize", () => {
  it("引用符の中の空白は区切らない", () => {
    expect(tokenize('git commit -m "fix: 直した"')).toEqual(["git", "commit", "-m", "fix: 直した"]);
    expect(tokenize("git commit -m ''")).toEqual(["git", "commit", "-m", ""]);
  });
});

describe("手動デプロイの流れ", () => {
  it("Hono の作成はテンプレート選択を待ち、選択後に作成する", () => {
    const started = run(presets.fresh(), "npm create hono@latest my-api");
    expect(started.state.cloned).toBe(false);
    expect(started.state.selectingTemplate).toBe(true);
    const selected = run(started.state, "cloudflare-workers");
    expect(selected.state.cloned).toBe(true);
    expect(selected.state.selectingTemplate).toBe(false);
  });

  it("clone → cd → install → dev → curl でレスポンスが返る", () => {
    const r = runAll(ready(), "npm run dev", "curl http://localhost:8787/hello/taro");
    expect(r.ok).toBe(true);
    expect(r.text).toContain('{"message":"Hello, taro!"}');
  });

  it("install 前の npm run dev は wrangler が見つからない", () => {
    const r = runAll(presets.fresh(), "git clone u my-api", "cd my-api", "npm run dev");
    expect(r.ok).toBe(false);
    expect(r.text).toContain("wrangler: command not found");
  });

  it("dev サーバーなしの curl は接続できない", () => {
    const r = runAll(ready(), "curl http://localhost:8787/");
    expect(r.ok).toBe(false);
    expect(r.text).toContain("Couldn't connect to server");
  });

  it("ログイン前の deploy は失敗し、ログイン後は公開できる", () => {
    expect(runAll(ready(), "npm run deploy").ok).toBe(false);
    const r = runAll(
      ready(),
      "npx wrangler login",
      "npm run deploy",
      `curl https://${PROD_HOST}/health`,
    );
    expect(r.ok).toBe(true);
    expect(r.text).toContain('{"status":"ok"}');
  });

  it("プロジェクトの外での npm は package.json がない", () => {
    expect(runAll(presets.fresh(), "npm install").text).toContain("Could not read package.json");
  });

  it("<…> を置き換えずに実行すると zsh のエラーとヒント", () => {
    const r = runAll(ready(), "curl https://my-api.<あなたのサブドメイン>.workers.dev/");
    expect(r.ok).toBe(false);
    expect(r.text).toContain("no such file or directory: あなたのサブドメイン");
  });

  it("存在しないルートは 404 のテキスト", () => {
    const r = runAll(ready(), "npm run dev", "curl -i http://localhost:8787/users");
    expect(r.text).toContain("HTTP/1.1 404 Not Found");
    expect(r.text).toContain("404 Not Found");
  });

  it("&& は前が失敗したら止まる", () => {
    const r = run(presets.fresh(), "cd my-api && npm install");
    expect(r.ok).toBe(false);
    expect(r.state.installed).toBe(false);
  });
});

describe("コードの中身と build・本番の関係", () => {
  const published = presets.published;

  it("打ち間違いは build で止まる", () => {
    const r = runAll({ ...published(), code: "typo" }, "npm run build");
    expect(r.ok).toBe(false);
    expect(r.text).toContain("error TS2551");
  });

  it("打ち間違いでも deploy は成功し、本番の /hello は 500 になる", () => {
    const r = runAll(
      { ...published(), code: "typo" },
      "npm run deploy",
      `curl https://${PROD_HOST}/hello/taro`,
    );
    expect(r.text).toContain("Internal Server Error");
  });

  it("Hi への変更は build を通り、本番のあいさつが変わる", () => {
    expect(runAll({ ...published(), code: "hi" }, "npm run build").ok).toBe(true);
    const r = runAll(
      { ...published(), code: "hi" },
      "npm run deploy",
      `curl https://${PROD_HOST}/hello/taro`,
    );
    expect(r.text).toContain('{"message":"Hi, taro!"}');
  });

  it("本番は公開したときのコードのまま（手元を変えただけでは変わらない）", () => {
    const r = runAll({ ...published(), code: "typo" }, `curl https://${PROD_HOST}/hello/taro`);
    expect(r.text).toContain("Hello, taro!");
  });
});

describe("git", () => {
  it("変更 → add → commit → push", () => {
    const s = { ...presets.published(), code: "hi" as const, dirty: true };
    const r = runAll(s, "git add .", 'git commit -m "change"', "git push origin main");
    expect(r.ok).toBe(true);
    expect(r.state.ahead).toBe(0);
    expect(r.text).toContain("main -> main");
  });

  it("変更がなければコミットできない", () => {
    expect(runAll(presets.published(), 'git commit -m "x"').ok).toBe(false);
  });
});

describe("補助", () => {
  it("isRunnable はシェルのコマンドだけを対象にする", () => {
    expect(isRunnable("git clone u my-api\ncd my-api\nnpm install")).toBe(true);
    expect(isRunnable("npm create hono@latest my-api\n# コメント\ncd my-api")).toBe(true);
    expect(isRunnable('import { Hono } from "hono";')).toBe(false);
    expect(isRunnable('{"message":"Hello"}')).toBe(false);
  });

  it("suggest は状態に応じて次のコマンドを出す", () => {
    expect(suggest(presets.fresh())[0]).toMatch(/^git clone/);
    expect(suggest(ready())).toContain("npm run dev");
  });

  it("complete は候補が1つに絞れたときだけ補完する", () => {
    expect(complete("npx wrangler lo")).toBe("npx wrangler login");
    expect(complete("npm run d")).toBeNull();
  });
});
