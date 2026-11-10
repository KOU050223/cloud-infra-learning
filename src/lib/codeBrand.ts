/**
 * コードブロックの中身とタイトルから、ヘッダーに出すサービスのロゴを決める。
 * 上から順に判定し、どれにも当たらなければ undefined。
 */
export type CodeBrand = "githubactions" | "cloudflareworkers" | "vitest" | "hono" | "npm" | "git";

export function detectCodeBrand(code: string, title?: string): CodeBrand | undefined {
  const t = title ?? "";
  const head = code.trimStart();
  if (t.includes(".github/workflows")) return "githubactions";
  if (t.includes("wrangler") || /\bwrangler\b/.test(code)) return "cloudflareworkers";
  if (/\.test\.[jt]s$/.test(t) || /\bvitest\b/.test(code)) return "vitest";
  if (code.includes('from "hono"') || t === "src/index.ts") return "hono";
  if (head.startsWith("git ")) return "git";
  if (t === "package.json" || head.startsWith("npm ")) return "npm";
  return undefined;
}
