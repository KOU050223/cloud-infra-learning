export type StageId = "push" | "install" | "build" | "deploy";
export type StageStatus = "pending" | "running" | "success" | "failure" | "skipped";

/**
 * 変更の壊れ方。
 * - none：正常
 * - type：型エラー（例：c.json を c.jsn と打ち間違えた）。Workers はデプロイ時に型を見ないので、
 *   チェックがなければそのまま公開され、本番でアクセスすると 500 になる。build（型チェック）で止められる。
 * - behavior：型は正しいが動作がおかしい（例：あいさつを Hello → Hi にした）。build は通ってしまう。
 */
export type Breakage = "none" | "type" | "behavior";

export interface Commit {
  id: string;
  label: string;
  breakage: Breakage;
}

export interface Release {
  version: number;
  label: string;
  healthy: boolean;
}

export interface PipelineResult {
  stages: Record<StageId, Exclude<StageStatus, "pending" | "running">>;
  /** パイプライン実行後に本番で動いているもの */
  production: Release;
  message: string;
}

export const stageOrder: StageId[] = ["push", "install", "build", "deploy"];

export const stageLabel: Record<StageId, string> = {
  push: "Push",
  install: "Install",
  build: "Build",
  deploy: "Deploy",
};

/**
 * 1回分のワークフロー実行を計算する。
 * withCheck=false は「CD のみ」のワークフロー。build チェックがないので型エラーもそのまま本番に出る。
 */
export function runPipeline(commit: Commit, current: Release, withCheck: boolean): PipelineResult {
  const next: Release = {
    version: current.version + 1,
    label: commit.label,
    healthy: commit.breakage === "none",
  };

  if (withCheck && commit.breakage === "type") {
    return {
      stages: { push: "success", install: "success", build: "failure", deploy: "skipped" },
      production: current,
      message:
        "型チェックで失敗したのでデプロイは止まりました。本番は前のバージョンのまま安全です。",
    };
  }

  const build = withCheck ? "success" : "skipped";
  const stages = { push: "success", install: "success", build, deploy: "success" } as const;

  if (commit.breakage === "type") {
    return {
      stages,
      production: next,
      message:
        "build チェックがないので、型エラー入りの変更がそのまま公開され、本番が 500 エラーを返しています。",
    };
  }
  if (commit.breakage === "behavior") {
    return {
      stages,
      production: next,
      message: withCheck
        ? "コードとしては正しいので build は通り、公開されました。でも返す内容が仕様と違います。これを止めるのがテスト（発展）です。"
        : "動作のおかしい変更がそのまま公開されました。build チェックがあっても、この種類の不具合は止められません。",
    };
  }
  return {
    stages,
    production: next,
    message: withCheck
      ? "build に通過したので、自動でデプロイされました。"
      : "デプロイ成功。新しいバージョンが公開されました。",
  };
}
