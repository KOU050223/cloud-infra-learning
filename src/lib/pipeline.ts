export type StageId = "push" | "install" | "test" | "deploy";
export type StageStatus = "pending" | "running" | "success" | "failure" | "skipped";

export interface Commit {
  id: string;
  label: string;
  /** バグを含む変更か */
  buggy: boolean;
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

export const stageOrder: StageId[] = ["push", "install", "test", "deploy"];

export const stageLabel: Record<StageId, string> = {
  push: "Push",
  install: "Install",
  test: "Test",
  deploy: "Deploy",
};

/**
 * 1回分のワークフロー実行を計算する。
 * withTests=false は「CD のみ」のワークフロー。テストがないのでバグもそのまま本番に出る。
 */
export function runPipeline(commit: Commit, current: Release, withTests: boolean): PipelineResult {
  const next: Release = {
    version: current.version + 1,
    label: commit.label,
    healthy: !commit.buggy,
  };

  if (!withTests) {
    return {
      stages: { push: "success", install: "success", test: "skipped", deploy: "success" },
      production: next,
      message: commit.buggy
        ? "テストがないので、バグ入りの変更がそのまま本番に出てしまいました。"
        : "デプロイ成功。新しいバージョンが公開されました。",
    };
  }

  if (commit.buggy) {
    return {
      stages: { push: "success", install: "success", test: "failure", deploy: "skipped" },
      production: current,
      message: "テストが失敗したのでデプロイは止まりました。本番は前のバージョンのまま安全です。",
    };
  }

  return {
    stages: { push: "success", install: "success", test: "success", deploy: "success" },
    production: next,
    message: "テストに通過したので、自動でデプロイされました。",
  };
}
