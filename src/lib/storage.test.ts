import { describe, expect, it } from "vite-plus/test";
import { emptyProgress, parseProgress } from "./storage";

describe("parseProgress", () => {
  it("未保存なら空の進捗", () => {
    expect(parseProgress(null)).toEqual(emptyProgress());
  });

  it("壊れた JSON でも落ちない", () => {
    expect(parseProgress("{not json")).toEqual(emptyProgress());
    expect(parseProgress("42")).toEqual(emptyProgress());
  });

  it("正しい値は復元する", () => {
    const saved = {
      completed: ["01", "02"],
      checks: { "h05-local": true },
      lastLessonId: "03",
      projectMode: "own",
      githubRepo: "taro/my-api",
      slideMode: true,
    };
    expect(parseProgress(JSON.stringify(saved))).toEqual(saved);
  });

  it("型が違う値や重複は捨てる", () => {
    const r = parseProgress(
      JSON.stringify({
        completed: ["01", 2, "01"],
        checks: { a: true, b: "yes" },
        lastLessonId: 5,
        projectMode: "other",
        githubRepo: "not a repo",
      }),
    );
    expect(r).toEqual({
      completed: ["01"],
      checks: { a: true },
      lastLessonId: null,
      projectMode: "template",
      githubRepo: null,
      slideMode: false,
    });
  });

  it("リポジトリは URL で保存されていても owner/repo に直す", () => {
    expect(
      parseProgress(JSON.stringify({ githubRepo: "https://github.com/taro/my-api.git" }))
        .githubRepo,
    ).toBe("taro/my-api");
  });
});
