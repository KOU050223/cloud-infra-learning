/**
 * ハンズオンで使うコマンドとコード。
 * GitHub Actions の `${{ }}` が Vue テンプレートの補間と衝突するため、文字列としてここに置く。
 */

/** TODO: 共通テンプレートのリポジトリを作成したら差し替える */
export const TEMPLATE_REPO = "https://github.com/YOUR_ORG/hono-workers-template";

export const cloneTemplate = `git clone ${TEMPLATE_REPO}.git my-api
cd my-api
npm install`;

export const createOwn = `npm create hono@latest my-api
# テンプレートを聞かれたら "cloudflare-workers" を選ぶ
cd my-api`;

export const honoIndex = `import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.json({ message: "Hello Hono!" }));
app.get("/hello/:name", (c) => c.json({ message: \`Hello, \${c.req.param("name")}!\` }));
app.get("/health", (c) => c.json({ status: "ok" }));

export default app;`;

export const wranglerConfig = `{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "my-api",            // 公開URLの一部になる（英小文字・数字・ハイフン）
  "main": "src/index.ts",
  "compatibility_date": "2026-11-01",
  "observability": { "enabled": true }  // ダッシュボードでログを見る
}`;

export const devCommand = `npm run dev`;

export const curlLocal = `curl http://localhost:8787/hello/taro`;

export const wranglerLogin = `npx wrangler login`;

export const wranglerDeploy = `npm run deploy`;

export const curlProd = `curl https://my-api.<あなたのサブドメイン>.workers.dev/hello/taro`;

export const secretPut = `npx wrangler secret put API_KEY`;

export const wranglerTail = `npx wrangler tail`;

export const whoami = `npx wrangler whoami`;

/** 後片付け（L13） */
export const wranglerDelete = `npx wrangler delete`;

export const wranglerLogout = `npx wrangler logout`;

/** build：型チェック（tsc）と、公開用にまとめられるかの確認（--dry-run なので公開はしない） */
export const packageScripts = `"scripts": {
  "dev": "wrangler dev",
  "deploy": "wrangler deploy --minify",
  "build": "tsc --noEmit && wrangler deploy --dry-run --outdir dist"
}`;

export const typescriptInstall = `npm install -D typescript`;

export const buildCommand = `npm run build`;

// --- 発展：テスト ---

export const vitestInstall = `npm install -D vitest`;

export const honoTest = `import { describe, expect, it } from "vitest";
import app from "../src/index";

describe("API", () => {
  it("GET /health は ok を返す", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  it("GET /hello/:name は名前入りのあいさつを返す", async () => {
    const res = await app.request("/hello/taro");
    expect(await res.json()).toEqual({ message: "Hello, taro!" });
  });
});`;

export const testScript = `"test": "vitest run"`;

export const workflowTestStep = `      - run: npm run build
      - run: npm test        # 追加：動作が仕様どおりかも確かめる`;

export const workflowCdOnly = `name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}`;

export const workflowCiCd = `name: CI/CD

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build

  deploy:
    needs: build                         # build が成功したときだけ動く
    if: github.event_name == 'push'      # PR では公開しない
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}`;

export const gitPush = `git add .
git commit -m "ci: GitHub Actions でデプロイする"
git push origin main`;

export const helloResponse = `{"message":"Hello, taro!"}`;

export const buildFailureLog = `> tsc --noEmit && wrangler deploy --dry-run --outdir dist

src/index.ts(6,34): error TS2551: Property 'jsn' does not exist on type 'Context<BlankEnv, "/hello/:name", BlankInput>'. Did you mean 'json'?
Error: Process completed with exit code 1.`;

export const breakCode = `// src/index.ts（わざと壊す：json を jsn と打ち間違える）
app.get("/hello/:name", (c) => c.jsn({ message: \`Hello, \${c.req.param("name")}!\` }));`;

export const breakPush = `git commit -am "change: /hello を修正（打ち間違いあり）"
git push origin main`;

export const fixPush = `git commit -am "fix: jsn を json に直す"
git push origin main`;

export const wrongCode = `// src/index.ts（型は正しいが、仕様と違う）
app.get("/hello/:name", (c) => c.json({ message: \`Hi, \${c.req.param("name")}!\` }));`;

export const testFailureLog = `- Expected
+ Received

  {
-   "message": "Hello, taro!",
+   "message": "Hi, taro!",
  }`;
