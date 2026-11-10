/**
 * ハンズオン用の「なんちゃってターミナル」。
 * clone・install・ログイン・dev サーバー・公開状況などを状態として持ち、
 * コマンドの結果を本物に近い形で返す。表示の細部は本物と異なる。
 */
import { handleRequest } from "./honoRouter";

/** src/index.ts の中身 */
export type CodeVariant = "ok" | "typo" | "hi";

export interface ShellState {
  cwd: "~" | "~/my-api";
  cloned: boolean;
  selectingTemplate?: boolean;
  installed: boolean;
  devRunning: boolean;
  loggedIn: boolean;
  /** 公開中のコード（未公開なら null） */
  deployed: CodeVariant | null;
  /** wrangler delete で Worker を削除したか（L13 の後片付け） */
  workerDeleted?: boolean;
  code: CodeVariant;
  /** コミットしていない変更があるか */
  dirty: boolean;
  staged: boolean;
  /** push していないコミット数 */
  ahead: number;
}

export type Tone = "out" | "muted" | "ok" | "err" | "warn" | "accent" | "hint";

export interface OutLine {
  text: string;
  tone?: Tone;
  /** この行を出すまでの待ち時間（ms） */
  delay?: number;
}

export interface RunResult {
  state: ShellState;
  lines: OutLine[];
  ok: boolean;
  clear?: boolean;
}

export const PROJECT = "my-api";
export const SUBDOMAIN = "your-name";
export const PROD_HOST = `${PROJECT}.${SUBDOMAIN}.workers.dev`;

export const presets = {
  /** 何もしていない状態 */
  fresh: (): ShellState => ({
    cwd: "~",
    cloned: false,
    installed: false,
    devRunning: false,
    loggedIn: false,
    deployed: null,
    code: "ok",
    dirty: false,
    staged: false,
    ahead: 0,
  }),
  /** 第1回を終えた状態（公開済み） */
  published: (): ShellState => ({
    cwd: "~/my-api",
    cloned: true,
    installed: true,
    devRunning: false,
    loggedIn: true,
    deployed: "ok",
    code: "ok",
    dirty: false,
    staged: false,
    ahead: 0,
  }),
};

const WRANGLER = " wrangler 4.x";
const RULE = "───────────────────";

const out = (text: string, tone: Tone = "out", delay = 0): OutLine => ({ text, tone, delay });
const hint = (text: string): OutLine => ({ text, tone: "hint" });

export function promptPath(s: ShellState): string {
  return s.cwd;
}

/** 引用符を考えて空白で区切る */
export function tokenize(line: string): string[] {
  const tokens: string[] = [];
  let cur = "";
  let quote: string | null = null;
  let has = false;
  for (const ch of line) {
    if (quote) {
      if (ch === quote) quote = null;
      else cur += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      has = true;
    } else if (/\s/.test(ch)) {
      if (has || cur) tokens.push(cur);
      cur = "";
      has = false;
    } else {
      cur += ch;
      has = true;
    }
  }
  if (has || cur) tokens.push(cur);
  return tokens;
}

const SHELL_WORDS = ["git", "npm", "npx", "curl", "cd", "ls", "cat", "pwd", "node", "wrangler"];

/** コードブロックの中身がこのターミナルで試せるコマンドか */
export function isRunnable(code: string): boolean {
  const lines = code
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  return lines.length > 0 && lines.every((l) => SHELL_WORDS.includes(tokenize(l)[0] ?? ""));
}

/** 1行を実行する。`a && b` は前が成功したときだけ続ける */
export function run(state: ShellState, input: string): RunResult {
  const line = input.trim();
  if (state.selectingTemplate) {
    if (line !== "cloudflare-workers")
      return fail(state, [hint("この演習では cloudflare-workers を選んでください。")]);
    return pass({ ...state, selectingTemplate: false, cloned: true }, [
      out("✔ Which template do you want to use? cloudflare-workers", "ok"),
      out("✔ Cloning the template", "ok", 400),
    ]);
  }
  if (!line || line.startsWith("#")) return { state, lines: [], ok: true };
  const parts = line.split("&&").map((p) => p.trim());
  let s = state;
  const lines: OutLine[] = [];
  for (const p of parts) {
    const r = runOne(s, p);
    s = r.state;
    lines.push(...r.lines);
    if (r.clear) return { state: s, lines: [], ok: true, clear: true };
    if (!r.ok) return { state: s, lines, ok: false };
  }
  return { state: s, lines, ok: true };
}

function fail(state: ShellState, lines: OutLine[]): RunResult {
  return { state, lines, ok: false };
}
function pass(state: ShellState, lines: OutLine[] = []): RunResult {
  return { state, lines, ok: true };
}

const inProject = (s: ShellState) => s.cwd === "~/my-api";

function noPackageJson(s: ShellState): RunResult {
  return fail(s, [
    out("npm error code ENOENT", "err"),
    out("npm error enoent Could not read package.json", "err"),
    hint(
      s.cloned
        ? "プロジェクトのフォルダの外にいます。cd my-api で移動しましょう。"
        : "まだプロジェクトがありません。git clone でテンプレートを取得しましょう。",
    ),
  ]);
}

function runOne(s: ShellState, line: string): RunResult {
  // <あなたのサブドメイン> のような置き換え前のプレースホルダー
  const placeholder = /<([^>]+)>/.exec(line);
  if (placeholder) {
    return fail(s, [
      out(`zsh: no such file or directory: ${placeholder[1]}`, "err"),
      hint(
        `<…> の部分は自分の値に置き換えて実行します。シミュレーターのサブドメインは ${SUBDOMAIN} です。`,
      ),
    ]);
  }

  const [cmd = "", ...args] = tokenize(line);
  switch (cmd) {
    case "help":
      return pass(s, helpLines());
    case "clear":
      return { state: s, lines: [], ok: true, clear: true };
    case "pwd":
      return pass(s, [out(s.cwd === "~" ? "/Users/you" : "/Users/you/my-api")]);
    case "ls":
      return ls(s);
    case "cd":
      return cd(s, args[0]);
    case "cat":
      return cat(s, args[0]);
    case "node":
      return args[0] === "-v" || args[0] === "--version"
        ? pass(s, [out("v22.11.0")])
        : pass(s, [hint("node -v でバージョンを確認できます。")]);
    case "git":
      return git(s, args);
    case "npm":
      return npm(s, args);
    case "npx":
      return args[0] === "wrangler"
        ? wrangler(s, args.slice(1))
        : fail(s, [out(`npm error could not determine executable to run`, "err")]);
    case "wrangler":
      return fail(s, [
        out("zsh: command not found: wrangler", "err"),
        hint(
          "wrangler はプロジェクトの中にインストールされています。npx wrangler … のように npx を付けて実行します。",
        ),
      ]);
    case "curl":
      return curl(s, args);
    default:
      return fail(s, [
        out(`zsh: command not found: ${cmd}`, "err"),
        hint("help で使えるコマンドの一覧を表示します。"),
      ]);
  }
}

function helpLines(): OutLine[] {
  return [
    out("このシミュレーターで使えるコマンド", "accent"),
    out("  git clone <URL> / git status / git add . / git commit -m … / git push"),
    out("  npm install / npm run dev / npm run build / npm run deploy"),
    out("  npx wrangler login / whoami / deploy / tail / secret put <名前>"),
    out("  npx wrangler delete / logout（後片付け）"),
    out("  curl http://localhost:8787/… / curl https://" + PROD_HOST + "/…"),
    out("  cd / ls / cat / pwd / clear"),
    hint("↑↓ で履歴、Tab で補完。右上で src/index.ts の中身を切り替えられます。"),
  ];
}

function ls(s: ShellState): RunResult {
  if (s.cwd === "~") return pass(s, s.cloned ? [out("my-api", "accent")] : []);
  const files = ["README.md", "package.json", "package-lock.json", "src", "tsconfig.json"];
  files.push("wrangler.jsonc");
  if (s.installed) files.push("node_modules");
  return pass(s, [out(files.sort().join("  "))]);
}

function cd(s: ShellState, to?: string): RunResult {
  if (!to || to === "~") return pass({ ...s, cwd: "~" });
  if (to === ".." && s.cwd === "~/my-api") return pass({ ...s, cwd: "~" });
  if ((to === "my-api" || to === "./my-api" || to === "~/my-api") && s.cloned)
    return pass({ ...s, cwd: "~/my-api" });
  if (to === "my-api" && !s.cloned)
    return fail(s, [
      out("cd: no such file or directory: my-api", "err"),
      hint("まだ my-api フォルダがありません。先に git clone しましょう。"),
    ]);
  return fail(s, [out(`cd: no such file or directory: ${to}`, "err")]);
}

const indexSource: Record<CodeVariant, string> = {
  ok: 'app.get("/hello/:name", (c) => c.json({ message: `Hello, ${c.req.param("name")}!` }));',
  typo: 'app.get("/hello/:name", (c) => c.jsn({ message: `Hello, ${c.req.param("name")}!` }));',
  hi: 'app.get("/hello/:name", (c) => c.json({ message: `Hi, ${c.req.param("name")}!` }));',
};

function cat(s: ShellState, file?: string): RunResult {
  if (!inProject(s) || !file)
    return fail(s, [out(`cat: ${file ?? ""}: No such file or directory`, "err")]);
  if (file === "src/index.ts")
    return pass(s, [
      out('import { Hono } from "hono";'),
      out(""),
      out("const app = new Hono();"),
      out(""),
      out('app.get("/", (c) => c.json({ message: "Hello Hono!" }));'),
      out(indexSource[s.code], s.code === "ok" ? "out" : "warn"),
      out('app.get("/health", (c) => c.json({ status: "ok" }));'),
      out(""),
      out("export default app;"),
    ]);
  if (file === "wrangler.jsonc")
    return pass(s, [
      out("{"),
      out(`  "name": "${PROJECT}",`),
      out('  "main": "src/index.ts",'),
      out('  "compatibility_date": "2026-11-01"'),
      out("}"),
    ]);
  if (file === "package.json")
    return pass(s, [
      out("{"),
      out(`  "name": "${PROJECT}",`),
      out('  "scripts": {'),
      out('    "dev": "wrangler dev",'),
      out('    "deploy": "wrangler deploy --minify",'),
      out('    "build": "tsc --noEmit && wrangler deploy --dry-run --outdir dist"'),
      out("  }"),
      out("}"),
    ]);
  return fail(s, [out(`cat: ${file}: No such file or directory`, "err")]);
}

function git(s: ShellState, args: string[]): RunResult {
  const sub = args[0];
  if (sub === "clone") {
    const url = args[1];
    if (!url) return fail(s, [out("fatal: You must specify a repository to clone.", "err")]);
    if (s.cwd !== "~") return fail(s, [hint("ホーム（cd ~）に戻ってから clone しましょう。")]);
    if (s.cloned)
      return fail(s, [
        out(
          "fatal: destination path 'my-api' already exists and is not an empty directory.",
          "err",
        ),
      ]);
    return pass({ ...s, cloned: true }, [
      out("Cloning into 'my-api'...", "out"),
      out("remote: Enumerating objects: 24, done.", "muted", 300),
      out("remote: Counting objects: 100% (24/24), done.", "muted", 250),
      out("Receiving objects: 100% (24/24), 18.40 KiB | 4.60 MiB/s, done.", "muted", 350),
    ]);
  }
  if (!inProject(s))
    return fail(s, [
      out("fatal: not a git repository (or any of the parent directories): .git", "err"),
    ]);
  if (sub === "status") {
    const lines = [out("On branch main")];
    if (s.ahead > 0)
      lines.push(out(`Your branch is ahead of 'origin/main' by ${s.ahead} commit(s).`));
    if (s.staged)
      lines.push(out("Changes to be committed:"), out("\tmodified:   src/index.ts", "ok"));
    else if (s.dirty)
      lines.push(out("Changes not staged for commit:"), out("\tmodified:   src/index.ts", "err"));
    else lines.push(out("nothing to commit, working tree clean"));
    return pass(s, lines);
  }
  if (sub === "add") return pass({ ...s, staged: s.dirty });
  if (sub === "commit") {
    const all = args.includes("-am") || args.includes("-a");
    const msgIdx = args.findIndex((a) => a === "-m" || a === "-am");
    const msg = msgIdx >= 0 ? args[msgIdx + 1] : undefined;
    if (!msg) return fail(s, [hint('git commit -m "変更の説明" のようにメッセージを付けます。')]);
    if (!s.staged && !(all && s.dirty))
      return fail(s, [
        out("On branch main"),
        out("nothing to commit, working tree clean"),
        hint(
          s.dirty
            ? "変更が add されていません。git add . してからコミットします。"
            : "変更がありません。右上で src/index.ts の中身を変えてみましょう。",
        ),
      ]);
    return pass({ ...s, dirty: false, staged: false, ahead: s.ahead + 1 }, [
      out(`[main 3f9c2a${s.ahead + 1}] ${msg}`),
      out(" 1 file changed, 1 insertion(+), 1 deletion(-)"),
    ]);
  }
  if (sub === "push") {
    if (s.ahead === 0) return pass(s, [out("Everything up-to-date")]);
    return pass({ ...s, ahead: 0 }, [
      out("Enumerating objects: 7, done.", "muted"),
      out("Writing objects: 100% (4/4), 412 bytes | 412.00 KiB/s, done.", "muted", 300),
      out("To github.com:you/my-api.git", "out", 200),
      out("   a1b2c3d..3f9c2ae  main -> main"),
      hint("GitHub Actions のワークフローがあれば、この push をきっかけに動き始めます（L10）。"),
    ]);
  }
  return fail(s, [out(`git: '${sub ?? ""}' is not a git command. See 'git --help'.`, "err")]);
}

function npm(s: ShellState, args: string[]): RunResult {
  const sub = args[0];
  if (sub === "-v" || sub === "--version") return pass(s, [out("10.9.0")]);
  if (sub === "create") {
    if (s.cloned) return fail(s, [out("error: Target directory my-api already exists.", "err")]);
    return pass({ ...s, selectingTemplate: true }, [
      out("create-hono version 0.x"),
      out("✔ Using target directory … my-api", "ok", 300),
      out("? Which template do you want to use?", "accent", 300),
      hint("この演習では cloudflare-workers を選びます。"),
    ]);
  }
  if (!inProject(s)) return noPackageJson(s);
  if (sub === "install" || sub === "i" || sub === "ci") {
    const pkg = args.slice(1).find((a) => !a.startsWith("-"));
    if (pkg)
      return pass({ ...s, installed: true }, [
        out(`added 1 package, and audited 60 packages in 2s`, "out", 600),
        out(""),
        out("found 0 vulnerabilities", "ok"),
      ]);
    return pass({ ...s, installed: true }, [
      out("⠙ reify: timing reifyNode:node_modules/wrangler", "muted", 200),
      out(`added 58 packages, and audited 59 packages in 4s`, "out", 1100),
      out(""),
      out("found 0 vulnerabilities", "ok"),
    ]);
  }
  if (sub === "run" || sub === "test" || sub === "start") {
    const script = sub === "run" ? args[1] : sub;
    if (!script)
      return pass(s, [
        out(`Scripts available in ${PROJECT} via \`npm run-script\`:`),
        out("  dev\n    wrangler dev"),
        out("  deploy\n    wrangler deploy --minify"),
        out("  build\n    tsc --noEmit && wrangler deploy --dry-run --outdir dist"),
      ]);
    if (!["dev", "deploy", "build"].includes(script)) {
      const near = ["dev", "deploy", "build"].find((x) => x.startsWith(script.slice(0, 2)));
      return fail(s, [
        out(`npm error Missing script: "${script}"`, "err"),
        ...(near ? [out("npm error", "err"), out(`npm error Did you mean "${near}"?`, "err")] : []),
        ...(script === "test"
          ? [hint("テストはまだ用意していません。L10 の「発展」で追加できます。")]
          : []),
      ]);
    }
    if (!s.installed)
      return fail(s, [
        out(`> ${PROJECT}@0.0.0 ${script}`, "muted"),
        out(`> ${scriptBody(script)}`, "muted"),
        out(""),
        out(`sh: ${script === "build" ? "tsc" : "wrangler"}: command not found`, "err"),
        hint("依存パッケージがまだ入っていません。先に npm install を実行します。"),
      ]);
    const head = [
      out(`> ${PROJECT}@0.0.0 ${script}`, "muted"),
      out(`> ${scriptBody(script)}`, "muted"),
      out(""),
    ];
    if (script === "dev") return dev(s, head);
    if (script === "build") return build(s, head);
    return deploy(s, head);
  }
  return fail(s, [out(`npm error Unknown command: "${sub ?? ""}"`, "err")]);
}

function scriptBody(script: string): string {
  if (script === "dev") return "wrangler dev";
  if (script === "deploy") return "wrangler deploy --minify";
  return "tsc --noEmit && wrangler deploy --dry-run --outdir dist";
}

function dev(s: ShellState, head: OutLine[]): RunResult {
  if (s.devRunning)
    return fail(s, [
      ...head,
      out("✘ [ERROR] Address already in use (127.0.0.1:8787).", "err"),
      hint("dev サーバーはすでに動いています。そのまま curl できます。"),
    ]);
  return pass({ ...s, devRunning: true }, [
    ...head,
    out(WRANGLER, "accent", 300),
    out(RULE, "muted"),
    out("[wrangler:info] Ready on http://localhost:8787", "ok", 700),
    hint(
      "本物のターミナルはここで止まったまま（サーバーが動き続ける）になります。curl は別のターミナルを開いて実行します。シミュレーターではこのまま続けて入力できます。",
    ),
  ]);
}

function build(s: ShellState, head: OutLine[]): RunResult {
  if (s.code === "typo")
    return fail(s, [
      ...head,
      out(
        `src/index.ts(6,34): error TS2551: Property 'jsn' does not exist on type 'Context<BlankEnv, "/hello/:name", BlankInput>'. Did you mean 'json'?`,
        "err",
        1200,
      ),
      hint(
        "型チェックで打ち間違いが見つかりました。右上で src/index.ts を「正常」に戻してみましょう。",
      ),
    ]);
  return pass(s, [
    ...head,
    out(WRANGLER, "accent", 1200),
    out(RULE, "muted"),
    out("Total Upload: 59.92 KiB / gzip: 15.15 KiB", "out", 400),
    out("No bindings found."),
    out("--dry-run: exiting now.", "ok"),
    ...(s.code === "hi"
      ? [
          hint(
            "コードとしては正しいので build は通りました。でもあいさつが仕様（Hello）と違います。",
          ),
        ]
      : []),
  ]);
}

function deploy(s: ShellState, head: OutLine[]): RunResult {
  if (!s.loggedIn)
    return fail(s, [
      ...head,
      out(WRANGLER, "accent", 300),
      out(RULE, "muted"),
      out("✘ [ERROR] You are not authenticated. Please run `wrangler login`.", "err", 400),
      hint("先に npx wrangler login で Cloudflare にログインします。"),
    ]);
  return pass({ ...s, deployed: s.code, workerDeleted: false }, [
    ...head,
    out(WRANGLER, "accent", 300),
    out(RULE, "muted"),
    out("Total Upload: 59.92 KiB / gzip: 15.15 KiB", "out", 500),
    out(`Uploaded ${PROJECT} (2.10 sec)`, "out", 900),
    out(`Deployed ${PROJECT} triggers (0.80 sec)`, "out", 500),
    out(`  https://${PROD_HOST}`, "accent"),
    out("Current Version ID: 8d2c1f7e-…", "muted"),
    ...(s.code === "typo"
      ? [
          hint(
            "型エラーがあっても公開は成功してしまいます（公開時に型は見ないため）。curl して確かめてみましょう。",
          ),
        ]
      : []),
  ]);
}

function wrangler(s: ShellState, args: string[]): RunResult {
  const sub = args[0];
  if (!inProject(s) || !s.installed)
    return fail(s, [
      out("npm error could not determine executable to run", "err"),
      hint(
        inProject(s)
          ? "wrangler がまだ入っていません。先に npm install を実行します。"
          : "プロジェクトのフォルダ（cd my-api）の中で実行します。",
      ),
    ]);
  if (sub === "login") {
    if (s.loggedIn)
      return pass(s, [out(WRANGLER, "accent"), out("You are already logged in.", "ok")]);
    return pass({ ...s, loggedIn: true }, [
      out(WRANGLER, "accent"),
      out(RULE, "muted"),
      out("Attempting to login via OAuth...", "out", 300),
      out(
        "Opening a link in your default browser: https://dash.cloudflare.com/oauth2/auth?…",
        "muted",
      ),
      hint("本物ではブラウザが開くので「Allow」を押します。"),
      out("Successfully logged in.", "ok", 1400),
    ]);
  }
  if (sub === "whoami") {
    if (!s.loggedIn)
      return pass(s, [
        out(WRANGLER, "accent"),
        out("You are not authenticated. Please run `wrangler login`.", "warn"),
      ]);
    return pass(s, [
      out(WRANGLER, "accent"),
      out(RULE, "muted"),
      out("You are logged in with an OAuth Token, associated with the email you@example.com."),
      out("┌──────────────────┬──────────────────────────────────┐"),
      out("│ Account Name     │ Account ID                       │"),
      out("├──────────────────┼──────────────────────────────────┤"),
      out("│ You's Account    │ 0123456789abcdef0123456789abcdef │"),
      out("└──────────────────┴──────────────────────────────────┘"),
      hint("Account ID は GitHub Secrets の CLOUDFLARE_ACCOUNT_ID に使います（L10）。"),
    ]);
  }
  if (sub === "deploy") return deploy(s, []);
  if (sub === "dev") return dev(s, []);
  if (sub === "tail") {
    if (!s.loggedIn) return deploy(s, []);
    if (!s.deployed)
      return fail(s, [
        out(`✘ [ERROR] Worker "${PROJECT}" not found.`, "err"),
        hint("まだ公開していません。先に npm run deploy します。"),
      ]);
    return pass(s, [
      out(WRANGLER, "accent"),
      out("Successfully created tail, expires at 2026-11-10T12:00:00Z", "ok", 500),
      out(`Connected to ${PROJECT}, waiting for logs...`, "muted"),
      hint(
        "本物はここでログを待ち続けます。別のターミナルから本番 URL に curl すると、リクエストが流れてきます。",
      ),
    ]);
  }
  if (sub === "secret" && args[1] === "put") {
    const name = args[2];
    if (!name) return fail(s, [out("✘ [ERROR] Not enough non-option arguments", "err")]);
    if (!s.loggedIn) return deploy(s, []);
    return pass(s, [
      out(WRANGLER, "accent"),
      out("✔ Enter a secret value: … ********", "out", 600),
      out(`Creating the secret for the Worker "${PROJECT}"`, "muted", 300),
      out(`Success! Uploaded secret ${name}`, "ok", 500),
      hint("本物では値の入力を求められます。入力した値は画面にも履歴にも残りません。"),
    ]);
  }
  if (sub === "delete") {
    if (!s.loggedIn) return deploy(s, []);
    if (!s.deployed)
      return fail(s, [
        out(WRANGLER, "accent"),
        out(RULE, "muted"),
        out(`✘ [ERROR] Worker "${PROJECT}" not found.`, "err", 400),
        hint(
          s.workerDeleted
            ? "Worker はすでに削除されています。"
            : "まだ公開していないので、削除するものはありません。",
        ),
      ]);
    return pass({ ...s, deployed: null, workerDeleted: true }, [
      out(WRANGLER, "accent"),
      out(RULE, "muted"),
      out(
        `? Are you sure you want to delete ${PROJECT}? This action cannot be undone. › y`,
        "warn",
      ),
      hint("本物では確認を求められるので、Worker の名前を確かめてから y を入力します。"),
      out(`Successfully deleted ${PROJECT}`, "ok", 900),
    ]);
  }
  if (sub === "logout") {
    if (!s.loggedIn)
      return pass(s, [out(WRANGLER, "accent"), out("Not logged in, exiting...", "muted")]);
    return pass({ ...s, loggedIn: false }, [
      out(WRANGLER, "accent"),
      out(RULE, "muted"),
      out("Successfully logged out.", "ok", 400),
    ]);
  }
  return fail(s, [out(`✘ [ERROR] Unknown argument: ${sub ?? ""}`, "err")]);
}

function curl(s: ShellState, args: string[]): RunResult {
  const showHead = args.includes("-i") || args.includes("--include");
  const xi = args.findIndex((a) => a === "-X" || a === "--request");
  const method = (xi >= 0 ? args[xi + 1] : "GET")?.toUpperCase() ?? "GET";
  const url = args.find((a, i) => !a.startsWith("-") && (xi < 0 || i !== xi + 1));
  if (!url) return fail(s, [out("curl: try 'curl --help' for more information", "err")]);

  let parsed: URL;
  try {
    parsed = new URL(url.includes("://") ? url : `http://${url}`);
  } catch {
    return fail(s, [out(`curl: (3) URL rejected: Malformed input to a URL function`, "err")]);
  }
  const path = parsed.pathname + parsed.search;

  if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
    if (parsed.port !== "8787" || !s.devRunning)
      return fail(s, [
        out(
          `curl: (7) Failed to connect to localhost port ${parsed.port || "80"} after 0 ms: Couldn't connect to server`,
          "err",
        ),
        hint(
          s.devRunning
            ? "dev サーバーは 8787 番ポートで動いています。"
            : "dev サーバーが動いていません。先に npm run dev を実行します。",
        ),
      ]);
    return pass(s, respond(s.code, method, path, showHead, "HTTP/1.1"));
  }

  if (parsed.hostname === PROD_HOST) {
    if (!s.deployed)
      return fail(s, [
        hint(
          s.workerDeleted
            ? "（シミュレーター）この URL の Worker は削除済みなので、JSON は返りません。本物では Cloudflare のエラーページが返ります。"
            : "（シミュレーター）この URL にはまだ何も公開されていません。npm run deploy で公開しましょう。",
        ),
      ]);
    return pass(s, respond(s.deployed, method, path, showHead, "HTTP/2"));
  }

  if (parsed.hostname.endsWith(".workers.dev"))
    return fail(s, [
      out(`curl: (6) Could not resolve host: ${parsed.hostname}`, "err"),
      hint(`シミュレーターでの公開先は ${PROD_HOST} です。`),
    ]);

  return fail(s, [hint("（シミュレーター）この環境では外部のサイトには接続できません。")]);
}

function respond(
  code: CodeVariant,
  method: string,
  path: string,
  showHead: boolean,
  proto: string,
): OutLine[] {
  const res = handleRequest(method, path);
  let status = res.status;
  let body = JSON.stringify(res.body);
  let type = "application/json";

  if (res.matched === null) {
    body = "404 Not Found";
    type = "text/plain;charset=UTF-8";
  } else if (res.matched === "/hello/:name" && status === 200) {
    if (code === "typo") {
      status = 500;
      body = "Internal Server Error";
      type = "text/plain;charset=UTF-8";
    } else if (code === "hi") {
      body = JSON.stringify({ message: String(res.body.message).replace(/^Hello/, "Hi") });
    }
  }

  const reason: Record<number, string> = {
    200: "OK",
    404: "Not Found",
    405: "Method Not Allowed",
    500: "Internal Server Error",
  };
  const tone: Tone = status >= 500 ? "err" : status >= 400 ? "warn" : "ok";
  const lines: OutLine[] = [];
  if (showHead)
    lines.push(
      out(`${proto} ${status}${proto === "HTTP/2" ? "" : ` ${reason[status] ?? ""}`}`, tone, 250),
      out(`content-type: ${type}`, "muted"),
      out(""),
    );
  lines.push(out(body, showHead ? "out" : tone, showHead ? 0 : 250));
  if (status === 500)
    lines.push(
      hint("c.jsn という存在しない関数を呼んだため、リクエストのたびにエラーになっています。"),
    );
  return lines;
}

/** 状態から「次に試すとよいコマンド」を出す */
export function suggest(s: ShellState): string[] {
  if (!s.cloned) return ["git clone https://github.com/YOUR_ORG/hono-workers-template.git my-api"];
  if (s.cwd === "~") return ["cd my-api"];
  if (!s.installed) return ["npm install", "ls"];
  const list: string[] = [];
  if (!s.devRunning) list.push("npm run dev");
  else list.push("curl http://localhost:8787/hello/taro");
  if (!s.loggedIn) list.push("npx wrangler login");
  else if (!s.deployed || s.deployed !== s.code) list.push("npm run deploy");
  if (s.deployed) list.push(`curl https://${PROD_HOST}/hello/taro`);
  list.push("npm run build");
  if (s.dirty) list.push('git commit -am "update"');
  if (s.ahead > 0) list.push("git push origin main");
  return list.slice(0, 4);
}

/** Tab 補完の候補 */
export const completions = [
  "git clone ",
  "git status",
  "git add .",
  'git commit -m ""',
  "git push origin main",
  "npm install",
  "npm run dev",
  "npm run build",
  "npm run deploy",
  "npx wrangler login",
  "npx wrangler whoami",
  "npx wrangler tail",
  "npx wrangler secret put ",
  "npx wrangler delete",
  "npx wrangler logout",
  "curl http://localhost:8787/",
  `curl https://${PROD_HOST}/`,
  "cd my-api",
  "cat src/index.ts",
  "clear",
  "help",
];

export function complete(prefix: string): string | null {
  if (!prefix) return null;
  const hits = completions.filter((c) => c.startsWith(prefix));
  return hits.length === 1 ? hits[0]! : null;
}
