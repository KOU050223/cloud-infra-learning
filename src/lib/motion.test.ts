import { describe, expect, it } from "vite-plus/test";
import { easeInOutCubic, easeOutCubic, isAbort, sleep } from "./motion";

describe("easing", () => {
  it("端点は 0 と 1", () => {
    for (const f of [easeInOutCubic, easeOutCubic]) {
      expect(f(0)).toBe(0);
      expect(f(1)).toBe(1);
    }
  });

  it("easeInOutCubic は中央で 0.5", () => {
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5);
  });
});

describe("sleep", () => {
  it("abort すると AbortError で止まる", async () => {
    const ac = new AbortController();
    const p = sleep(10_000, ac.signal);
    ac.abort();
    await expect(p).rejects.toSatisfy(isAbort);
  });

  it("すでに abort 済みなら即座に reject", async () => {
    const ac = new AbortController();
    ac.abort();
    await expect(sleep(10, ac.signal)).rejects.toSatisfy(isAbort);
  });
});
