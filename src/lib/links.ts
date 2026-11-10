/**
 * 手順で案内する外部ページの URL。
 * Cloudflare は固定の URL、GitHub はリポジトリごとに組み立てる。
 */
export const links = {
  cfApiTokens: "https://dash.cloudflare.com/profile/api-tokens",
  cfWorkers: "https://dash.cloudflare.com/?to=/:account/workers-and-pages",
  cfSignUp: "https://dash.cloudflare.com/sign-up",
  ghSignUp: "https://github.com/signup",
  ghNewRepo: "https://github.com/new",
  gitDownload: "https://git-scm.com/downloads",
  nodeDownload: "https://nodejs.org/",
  vscode: "https://code.visualstudio.com/",
} as const;

export type RepoPage = "secrets" | "newSecret" | "actions";

const repoPaths: Record<RepoPage, string> = {
  secrets: "settings/secrets/actions",
  newSecret: "settings/secrets/actions/new",
  actions: "actions",
};

const NAME = /^[A-Za-z0-9_.-]+$/;

/**
 * 「owner/repo」や GitHub の URL（.git 付き・末尾スラッシュ付きも可）から owner/repo を取り出す。
 * 形がおかしければ null。
 */
export function normalizeRepo(input: string): string | null {
  let s = input.trim();
  s = s.replace(/^git@github\.com:/, "");
  s = s.replace(/^(https?:\/\/)?(www\.)?github\.com\//, "");
  s = s.replace(/\.git$/, "").replace(/\/+$/, "");
  const [owner, repo, ...rest] = s.split("/");
  if (!owner || !repo || rest.length > 0) return null;
  if (!NAME.test(owner) || !NAME.test(repo)) return null;
  return `${owner}/${repo}`;
}

export function repoUrl(repo: string, page: RepoPage): string {
  return `https://github.com/${repo}/${repoPaths[page]}`;
}
