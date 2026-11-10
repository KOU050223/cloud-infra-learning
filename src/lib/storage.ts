import { normalizeRepo } from "./links";

export type ProjectMode = "template" | "own";

export interface ProgressState {
  completed: string[];
  checks: Record<string, boolean>;
  lastLessonId: string | null;
  projectMode: ProjectMode;
  /** 手順のリンク先に使う GitHub リポジトリ（owner/repo） */
  githubRepo: string | null;
  /** レッスンをスライドで表示するか */
  slideMode: boolean;
}

export const STORAGE_KEY = "cloud-infra-learning:progress:v1";

export function emptyProgress(): ProgressState {
  return {
    completed: [],
    checks: {},
    lastLessonId: null,
    projectMode: "template",
    githubRepo: null,
    slideMode: false,
  };
}

/** 壊れた値や古い形式が入っていても、使える部分だけ取り出す */
export function parseProgress(raw: string | null): ProgressState {
  const base = emptyProgress();
  if (!raw) return base;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return base;
  }
  if (typeof data !== "object" || data === null) return base;
  const d = data as Record<string, unknown>;

  if (Array.isArray(d.completed)) {
    base.completed = [...new Set(d.completed.filter((v): v is string => typeof v === "string"))];
  }
  if (typeof d.checks === "object" && d.checks !== null && !Array.isArray(d.checks)) {
    for (const [k, v] of Object.entries(d.checks)) {
      if (typeof v === "boolean") base.checks[k] = v;
    }
  }
  if (typeof d.lastLessonId === "string") base.lastLessonId = d.lastLessonId;
  if (d.projectMode === "own" || d.projectMode === "template") base.projectMode = d.projectMode;
  if (typeof d.githubRepo === "string") base.githubRepo = normalizeRepo(d.githubRepo);
  if (typeof d.slideMode === "boolean") base.slideMode = d.slideMode;
  return base;
}

export function loadProgress(): ProgressState {
  try {
    return parseProgress(globalThis.localStorage?.getItem(STORAGE_KEY) ?? null);
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(state: ProgressState): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // プライベートモード等で保存できなくても学習は続けられる
  }
}
