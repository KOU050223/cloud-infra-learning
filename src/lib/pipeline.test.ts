import { describe, expect, it } from "vite-plus/test";
import { runPipeline, type Commit, type Release } from "./pipeline";

const v1: Release = { version: 1, label: "最初", healthy: true };
const good: Commit = { id: "g", label: "機能追加", breakage: "none" };
const typo: Commit = { id: "t", label: "打ち間違い", breakage: "type" };
const wrong: Commit = { id: "w", label: "文言ミス", breakage: "behavior" };

describe("runPipeline", () => {
  it("CDのみ：正常な変更はデプロイされる", () => {
    const r = runPipeline(good, v1, false);
    expect(r.stages.build).toBe("skipped");
    expect(r.stages.deploy).toBe("success");
    expect(r.production).toEqual({ version: 2, label: "機能追加", healthy: true });
  });

  it("CDのみ：型エラーもそのまま本番に出る", () => {
    const r = runPipeline(typo, v1, false);
    expect(r.stages.deploy).toBe("success");
    expect(r.production.healthy).toBe(false);
  });

  it("CI/CD：型エラーは build で止まり、本番は変わらない", () => {
    const r = runPipeline(typo, v1, true);
    expect(r.stages.build).toBe("failure");
    expect(r.stages.deploy).toBe("skipped");
    expect(r.production).toBe(v1);
  });

  it("CI/CD：動作の不具合は build を通ってしまう", () => {
    const r = runPipeline(wrong, v1, true);
    expect(r.stages.build).toBe("success");
    expect(r.stages.deploy).toBe("success");
    expect(r.production.healthy).toBe(false);
  });

  it("CI/CD：壊れた本番も、正常な変更で復旧する", () => {
    const broken: Release = { version: 2, label: "打ち間違い", healthy: false };
    const r = runPipeline(good, broken, true);
    expect(r.stages).toEqual({
      push: "success",
      install: "success",
      build: "success",
      deploy: "success",
    });
    expect(r.production).toEqual({ version: 3, label: "機能追加", healthy: true });
  });
});
