/**
 * 図解アニメーション用の小さなヘルパー。
 * すべて AbortSignal で中断でき、中断時は AbortError で reject する。
 */

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function abortError() {
  return new DOMException("aborted", "AbortError");
}

export function isAbort(e: unknown): boolean {
  return e instanceof DOMException && e.name === "AbortError";
}

export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError());
    const t = setTimeout(resolve, prefersReducedMotion() ? 0 : ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        reject(abortError());
      },
      { once: true },
    );
  });
}

/** duration ミリ秒かけて 0→1 の進捗を onUpdate に渡す */
export function tween(
  duration: number,
  onUpdate: (t: number) => void,
  { signal, ease = easeInOutCubic }: { signal?: AbortSignal; ease?: (t: number) => number } = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError());
    if (prefersReducedMotion() || duration <= 0) {
      onUpdate(1);
      return resolve();
    }
    let raf = 0;
    const start = performance.now();
    const frame = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      onUpdate(ease(p));
      if (p < 1) raf = requestAnimationFrame(frame);
      else resolve();
    };
    raf = requestAnimationFrame(frame);
    signal?.addEventListener(
      "abort",
      () => {
        cancelAnimationFrame(raf);
        reject(abortError());
      },
      { once: true },
    );
  });
}

export interface Point {
  x: number;
  y: number;
}

/** SVG パスに沿って動かす。trail には直近の位置を新しい順に入れる */
export function travelAlong(
  path: SVGPathElement,
  duration: number,
  onMove: (p: Point, trail: Point[]) => void,
  opts: { signal?: AbortSignal; reverse?: boolean; trailLength?: number } = {},
): Promise<void> {
  const len = path.getTotalLength();
  const trail: Point[] = [];
  const max = opts.trailLength ?? 10;
  return tween(
    duration,
    (t) => {
      const at = opts.reverse ? 1 - t : t;
      const pt = path.getPointAtLength(len * at);
      const p = { x: pt.x, y: pt.y };
      trail.unshift(p);
      if (trail.length > max) trail.pop();
      onMove(p, [...trail]);
    },
    { signal: opts.signal },
  );
}
