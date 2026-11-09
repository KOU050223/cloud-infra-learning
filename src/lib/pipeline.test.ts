import { describe, expect, it } from "vite-plus/test";
import { runPipeline, type Release } from "./pipeline";

const v1: Release = { version: 1, label: "最初", healthy: true };
const good = { id: "g", label: "機能追加", buggy: false };
const bad = { id: "b", label: "バグ", buggy: true };

describe("runPipeline", () => {
  it("CDのみ：正常な変更はデプロイされる", () => {
    const r = runPipeline(good, v1, false);
    expect(r.stages.test).toBe("skipped");
    expect(r.stages.deploy).toBe("success");
    expect(r.production).toEqual({ version: 2, label: "機能追加", healthy: true });
  });

  it("CDのみ：バグもそのまま本番に出る", () => {
    const r = runPipeline(bad, v1, false);
    expect(r.stages.deploy).toBe("success");
    expect(r.production.healthy).toBe(false);
  });

  it("CI/CD：バグはテストで止まり、本番は変わらない", () => {
    const r = runPipeline(bad, v1, true);
    expect(r.stages.test).toBe("failure");
    expect(r.stages.deploy).toBe("skipped");
    expect(r.production).toBe(v1);
  });

  it("CI/CD：壊れた本番も、正常な変更で復旧する", () => {
    const broken: Release = { version: 2, label: "バグ", healthy: false };
    const r = runPipeline(good, broken, true);
    expect(r.stages).toEqual({
      push: "success",
      install: "success",
      test: "success",
      deploy: "success",
    });
    expect(r.production).toEqual({ version: 3, label: "機能追加", healthy: true });
  });
});
