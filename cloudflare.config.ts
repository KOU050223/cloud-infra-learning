import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "cloud-infra-learning",
    compatibilityDate: "2026-11-10",
    assets: { notFoundHandling: "single-page-application" },
    observability: { enabled: true, traces: { enabled: true } },
  },
});
