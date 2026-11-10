import { describe, expect, it } from "vite-plus/test";
import { assignSlides, clampSlide } from "./slides";

describe("assignSlides", () => {
  it("区切りの手前で新しいスライドを始める", () => {
    // 導入文, 導入文, h2, 本文, クイズ
    expect(assignSlides([false, false, true, false, true])).toEqual({
      slideOf: [0, 0, 1, 1, 2],
      count: 3,
    });
  });

  it("先頭が区切りでも空のスライドを作らない", () => {
    expect(assignSlides([true, false, true])).toEqual({ slideOf: [0, 0, 1], count: 2 });
  });

  it("区切りが連続したらそれぞれ1枚にする", () => {
    expect(assignSlides([false, true, true])).toEqual({ slideOf: [0, 1, 2], count: 3 });
  });

  it("要素がなければ0枚", () => {
    expect(assignSlides([])).toEqual({ slideOf: [], count: 0 });
  });
});

describe("clampSlide", () => {
  it("1始まりの値を0始まりに直し、範囲に収める", () => {
    expect(clampSlide("3", 5)).toBe(2);
    expect(clampSlide("99", 5)).toBe(4);
    expect(clampSlide("0", 5)).toBe(0);
    expect(clampSlide(undefined, 5)).toBe(0);
    expect(clampSlide("abc", 5)).toBe(0);
    expect(clampSlide(["2"], 5)).toBe(1);
  });
});
