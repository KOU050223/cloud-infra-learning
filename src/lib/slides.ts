/**
 * レッスン本文をスライドに区切る。
 * 区切りの印が付いた要素（見出し h2、ハンズオンの手順、クイズ）の手前で新しいスライドを始める。
 * 先頭が区切りでも空のスライドは作らない。
 */
export function assignSlides(breaks: boolean[]): { slideOf: number[]; count: number } {
  const slideOf: number[] = [];
  let current = -1;
  let hasContent = false;
  for (const isBreak of breaks) {
    if (current < 0 || (isBreak && hasContent)) {
      current++;
      hasContent = false;
    }
    slideOf.push(current);
    hasContent = true;
  }
  return { slideOf, count: current + 1 };
}

/** URL の ?s=3 のような値を、0 始まりの範囲内の番号にする */
export function clampSlide(raw: unknown, count: number): number {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  if (!Number.isFinite(n) || count <= 0) return 0;
  return Math.min(Math.max(Math.trunc(n) - 1, 0), count - 1);
}
