import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { createVizeLintConfig } from "oxlint-plugin-vize";
import { defineConfig } from "vite-plus";

// Vue テンプレートの lint は Vize Patina を Oxlint 経由で動かす
const vizeLint = createVizeLintConfig({
  preset: "happy-path",
  settings: { locale: "ja", helpLevel: "short" },
});

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  staged: {
    "*": "vp check --fix",
  },
  fmt: {},
  lint: {
    ...vizeLint,
    jsPlugins: [
      ...(vizeLint.jsPlugins ?? []),
      { name: "vite-plus", specifier: "vite-plus/oxlint-plugin" },
    ],
    rules: { ...vizeLint.rules, "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
    ignorePatterns: ["dist/**"],
  },
  test: {
    environment: "node",
  },
});
