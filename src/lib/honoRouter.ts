/**
 * 配布テンプレートと同じルートを持つ、ブラウザ内の「なんちゃって Hono」。
 * リクエストの旅シミュレーターで、パスによってレスポンスが変わる様子を見せるために使う。
 */
export interface SimResponse {
  status: number;
  body: Record<string, unknown>;
  matched: string | null;
}

const routes: {
  pattern: string;
  handle: (params: Record<string, string>) => SimResponse["body"];
}[] = [
  { pattern: "/", handle: () => ({ message: "Hello Hono!" }) },
  { pattern: "/hello/:name", handle: (p) => ({ message: `Hello, ${p.name}!` }) },
  { pattern: "/health", handle: () => ({ status: "ok" }) },
];

function match(pattern: string, path: string): Record<string, string> | null {
  const ps = pattern.split("/").filter(Boolean);
  const xs = path.split("/").filter(Boolean);
  if (ps.length !== xs.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < ps.length; i++) {
    const p = ps[i]!;
    const x = xs[i]!;
    if (p.startsWith(":")) {
      try {
        params[p.slice(1)] = decodeURIComponent(x);
      } catch {
        params[p.slice(1)] = x;
      }
    } else if (p !== x) return null;
  }
  return params;
}

export function handleRequest(method: string, path: string): SimResponse {
  const pathname = path.split("?")[0] || "/";
  for (const r of routes) {
    const params = match(r.pattern, pathname);
    if (params) {
      if (method !== "GET")
        return { status: 405, body: { error: "Method Not Allowed" }, matched: r.pattern };
      return { status: 200, body: r.handle(params), matched: r.pattern };
    }
  }
  return { status: 404, body: { error: "Not Found" }, matched: null };
}

export const routePatterns = routes.map((r) => r.pattern);
