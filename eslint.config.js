// @ts-check

import { createRequire } from 'node:module';

import { fixupPluginRules } from '@eslint/compat';
import eslint from '@eslint/js';
import * as import_ from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import react_hooks from 'eslint-plugin-react-hooks';
import react_refresh from 'eslint-plugin-react-refresh';
import storybook from 'eslint-plugin-storybook';
import tailwindcss from 'eslint-plugin-tailwindcss';
import turbo from 'eslint-plugin-turbo';
import vitest from 'eslint-plugin-vitest';
import tseslint from 'typescript-eslint';

/** @see https://github.com/storybookjs/eslint-plugin-storybook/pull/156#issuecomment-2182224439 */
const storybookPluginConfigs = tseslint.config(
  ...storybook.configs['flat/recommended'].filter(
    c => c.name !== 'storybook:recommended:stories-rules',
  ),
  {
    name: 'custom:fixed-recommended:stories-rules',
    files: ['**/*.stories.@(ts|tsx|js|jsx|mjs|cjs)', '**/*.story.@(ts|tsx|js|jsx|mjs|cjs)'],
    rules: {
      ...storybook.configs['flat/recommended'].find(
        c => c.name === 'storybook:recommended:stories-rules',
      ).rules,
    },
  },
);

export default tseslint.config(
  // completely ignored files
  { name: 'custom:ignores', ignores: ['vitest.workspace.ts', 'dist', 'node_modules', '**/.next/'] },

  // base javascript config
  eslint.configs.recommended,

  // base typescript config
  tseslint.configs.eslintRecommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    name: 'custom:languageOptions-parserOptions-project-true',
    languageOptions: { parser: tseslint.parser, parserOptions: { project: true } },
  },

  // tailwind config
  {
    name: 'custom:tailwindcss-config',
    plugins: { tailwindcss },
    settings: {
      tailwindcss: { config: createRequire(import.meta.url).resolve('@repo/tailwind-config') },
    },
    rules: {
      ...tailwindcss.configs.recommended.rules,
      'tailwindcss/no-custom-classname': ['error', { callees: ['cn', 'cva'] }],
    },
  },

  {
    name: 'custom:react-plugins',
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: {
      // @ts-expect-error - react is incorrectly typed
      react: fixupPluginRules(react),
      // @ts-expect-error - react_hooks is incorrectly typed
      'react-hooks': fixupPluginRules(react_hooks),
      'react-refresh': react_refresh,
    },
    // @ts-expect-error - rules are incorrectly typed
    rules: {
      ...react.configs.recommended.rules,
      ...react_hooks.configs.recommended.rules,
    },
  },
  {
    name: 'custom:react-wishlist-improvements',
    rules: {
      // these were from a broken plugin. should be enabled and fixed.
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/rules-of-hooks': 'off',

      // this plugin was formerly included, but was never actually applied.
      'react-refresh/only-export-components': 'off',

      //'react/jsx-no-literals': 'warn',
      //'react/jsx-no-useless-fragment': 'warn',
    },
  },

  {
    name: 'custom:import-enabled',
    plugins: { import: import_ },
    settings: { 'import/resolver': { typescript: true } },
    rules: {
      // be aware this rule doesn't always provide correct fixes. its bad fixes
      // will fail to compile, and are easy to correct manually.
      'import/no-duplicates': ['error', { 'prefer-inline': true }],

      // import plugin rules
      'import/first': 'error',
      'import/no-relative-packages': 'error',
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': 'error',

      // ts import rules
      '@typescript-eslint/no-import-type-side-effects': 'error',

      // proposed configs. large diff, so these are disabled later.
      'sort-imports': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      'import/order': [
        'error',
        {
          pathGroups: [
            { pattern: '@penumbra-labs/**', group: 'external', position: 'after' },
            { pattern: '@buf/**', group: 'external', position: 'after' },
            { pattern: '@penumbra-zone/**', group: 'internal', position: 'before' },
            { pattern: '@buf/penumbra-zone_penumbra.*', group: 'internal', position: 'before' },
            { pattern: '@repo/**', group: 'internal', position: 'after' },
          ],
          pathGroupsExcludedImportTypes: [],
          distinctGroup: true,
          'newlines-between': 'always',
          alphabetize: { order: 'asc' },
        },
      ],
    },
  },
  {
    name: 'custom:import-wishlist-improvements',
    rules: {
      // these are defined above, but disabled here, due to large diff
      'sort-imports': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      'import/order': 'off',
    },
  },

  {
    name: 'custom:enabled-everywhere',
    rules: {
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
      '@typescript-eslint/no-unnecessary-condition': [
        'error',
        { allowConstantLoopConditions: true },
      ],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        { requireDefaultForNonUnion: true },
      ],
      curly: ['error', 'all'],
      eqeqeq: ['error', 'smart'],
    },
  },

  {
    name: 'custom:explicitly-declare-let',
    files: ['**/*.@(ts|tsx)'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          message: 'You must explicitly annotate `let` declarations.',
          selector:
            "VariableDeclaration[kind = 'let'] > VariableDeclarator[init = null]:not([id.typeAnnotation])",
        },
      ],
    },
  },

  {
    name: 'custom:typescript-wishlist-improvements',
    files: ['**/*.@(ts|tsx)'],
    rules: {
      // enabled by tseslint strictTypeChecked. large diff
      '@typescript-eslint/no-non-null-assertion': 'off',

      //'@typescript-eslint/no-redeclare': 'error',
      //'@typescript-eslint/no-shadow': 'error',
      //'@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },

  {
    name: 'custom:eslint-wishlist-improvements',
    rules: {
      //'array-callback-return': 'warn',
      //'class-methods-use-this': 'warn',
      //'consistent-return': 'warn',
      //'consistent-this': 'error',
      //'func-name-matching': 'warn',
      //'no-await-in-loop': 'warn',
      //'no-bitwise': 'warn',
      //'no-console': 'warn',
      //'no-continue': 'warn',
      //'no-nested-ternary': 'warn',
      //'no-param-reassign': 'error',
      //'no-plusplus': 'error',
      //'no-promise-executor-return': ['error', { allowVoid: true }],
      //'no-restricted-globals': [ 'error', { message: 'Use `globalThis` instead.', name: 'global' }, { message: 'Use `globalThis` instead.', name: 'self' }, ],
      //'no-self-assign': ['error', { props: true }],
      //'no-template-curly-in-string': 'warn',
      //'no-unreachable-loop': 'warn',
      //'no-warning-comments': 'warn',
      //'prefer-regex-literals': ['error', { disallowRedundantWrapping: true }],
      //'spaced-comment': 'warn',
      //complexity: 'warn',
    },
  },

  // turbo config
  {
    name: 'custom:turbo-config',
    plugins: { turbo },
    rules: { 'turbo/no-undeclared-env-vars': 'error' },
  },

  // test rules
  vitest.configs.recommended,
  ...storybookPluginConfigs,

  // these rules aren't helpful in tests
  {
    name: 'custom:disable-in-tests',
    files: [
      '**/*.test.@(ts|tsx|js|jsx|mjs|cjs)',
      '**/*.stories.@(ts|tsx|js|jsx|mjs|cjs)',
      '**/*.story.@(ts|tsx|js|jsx|mjs|cjs)',
    ],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      'react/display-name': 'off',
    },
  },

  // enabled by imported sets above, but we don't want them.
  {
    name: 'custom:disable-everywhere',
    rules: {
      '@typescript-eslint/no-invalid-void-type': 'off', // this one is often wrong
      '@typescript-eslint/triple-slash-reference': 'off', // these are useful

      'react/prop-types': 'off', // unecessary for typescript codebase
      'react/react-in-jsx-scope': 'off', // unecessary for modern react
    },
  },

  // disable typed linting for non-ts files
  { ignores: ['**/*.@(ts|tsx)'], ...tseslint.configs.disableTypeChecked },

  // disable rules covered by prettier
  prettier,
);
