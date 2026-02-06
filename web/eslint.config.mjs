import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Project-specific ignores:
    "public/generated/**",
    "scripts/**/*.cjs",
  ]),

  // Extra safety: ensure these paths are ignored in all configs.
  {
    ignores: ["public/generated/**", "scripts/**/*.cjs"],
  },
]);

export default eslintConfig;
