import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import tseslint from 'typescript-eslint';

const sourceFiles = [
  'src/**/*.{js,jsx,ts,tsx,mjs,cjs}',
  '*.{js,mjs,ts}',
  'next.config.ts',
  'next-env.d.ts',
];

const nextGeneratedTypeFiles = [
  '**/.next/types/**/*.{ts,d.ts}',
  '**/.next/dev/types/**/*.{ts,d.ts}',
];

const disabledTypescriptEslintRules = Object.fromEntries(
  Object.keys(tseslint.plugin.rules).map((rule) => [
    `@typescript-eslint/${rule}`,
    'off',
  ]),
);

const eslintConfig = defineConfig([
  globalIgnores([
    '**/.next/**',
    'out/**',
    'build/**',
    'scripts/**',
    '.cursor/**',
    'node_modules/**',
  ]),
  ...nextVitals,
  ...nextTs,
  {
    files: sourceFiles,
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  // Next.js regenerates route type stubs under `.next/**`. Never edit them;
  // disable lint rules when a tool lints them directly (e.g. --no-ignore).
  {
    files: nextGeneratedTypeFiles,
    rules: disabledTypescriptEslintRules,
  },
]);

export default eslintConfig;
