import { describe, expect, it } from "vite-plus/test";
import { detectCodeBrand } from "./codeBrand";

describe("detectCodeBrand", () => {
  it("ワークフローファイルは GitHub Actions", () => {
    expect(
      detectCodeBrand("name: Deploy\n  run: npx wrangler deploy", ".github/workflows/deploy.yml"),
    ).toBe("githubactions");
  });

  it("wrangler のコマンドや設定は Cloudflare Workers", () => {
    expect(detectCodeBrand("npx wrangler login")).toBe("cloudflareworkers");
    expect(detectCodeBrand("{}", "wrangler.jsonc")).toBe("cloudflareworkers");
  });

  it("テストファイルや vitest は Vitest", () => {
    expect(detectCodeBrand("npm install -D vitest")).toBe("vitest");
    expect(detectCodeBrand("it()", "test/index.test.ts")).toBe("vitest");
  });

  it("Hono のコードは Hono", () => {
    expect(detectCodeBrand('import { Hono } from "hono";')).toBe("hono");
    expect(detectCodeBrand("// 変更", "src/index.ts")).toBe("hono");
  });

  it("git / npm コマンド", () => {
    expect(detectCodeBrand("git add .\ngit push")).toBe("git");
    expect(detectCodeBrand("npm run dev")).toBe("npm");
    expect(detectCodeBrand('"scripts": {}', "package.json")).toBe("npm");
  });

  it("当てはまらなければ undefined", () => {
    expect(detectCodeBrand("curl http://localhost:8787")).toBeUndefined();
    expect(detectCodeBrand('{"message":"hi"}', "レスポンス")).toBeUndefined();
  });
});
