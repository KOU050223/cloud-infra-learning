import { describe, expect, it } from "vite-plus/test";
import { normalizeRepo, repoUrl } from "./links";

describe("normalizeRepo", () => {
  it("owner/repo はそのまま", () => {
    expect(normalizeRepo("taro/my-api")).toBe("taro/my-api");
    expect(normalizeRepo("  taro/my-api  ")).toBe("taro/my-api");
  });

  it("GitHub の URL から取り出せる", () => {
    expect(normalizeRepo("https://github.com/taro/my-api")).toBe("taro/my-api");
    expect(normalizeRepo("https://github.com/taro/my-api.git")).toBe("taro/my-api");
    expect(normalizeRepo("github.com/taro/my-api/")).toBe("taro/my-api");
    expect(normalizeRepo("git@github.com:taro/my-api.git")).toBe("taro/my-api");
  });

  it("形がおかしければ null", () => {
    expect(normalizeRepo("")).toBeNull();
    expect(normalizeRepo("taro")).toBeNull();
    expect(normalizeRepo("https://github.com/taro/my-api/tree/main")).toBeNull();
    expect(normalizeRepo("taro/my api")).toBeNull();
    expect(normalizeRepo("https://example.com/taro/my-api")).toBeNull();
  });
});

describe("repoUrl", () => {
  it("リポジトリのページ URL を組み立てる", () => {
    expect(repoUrl("taro/my-api", "newSecret")).toBe(
      "https://github.com/taro/my-api/settings/secrets/actions/new",
    );
    expect(repoUrl("taro/my-api", "actions")).toBe("https://github.com/taro/my-api/actions");
    expect(repoUrl("taro/my-api", "workflow")).toBe(
      "https://github.com/taro/my-api/actions/workflows/deploy.yml",
    );
  });
});
