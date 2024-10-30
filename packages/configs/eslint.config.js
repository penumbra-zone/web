// @ts-expect-error https://github.com/eslint-community/eslint-plugin-eslint-comments/issues/214
import ESLintPluginESLintCommentsConfigs from '@eslint-community/eslint-plugin-eslint-comments/configs';
import { fixupPluginRules } from '@eslint/compat';
import eslint from '@eslint/js';
import * as import_ from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import react_hooks from 'eslint-plugin-react-hooks';
import react_refresh from 'eslint-plugin-react-refresh';
import storybook from 'eslint-plugin-storybook';
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

// The plugin is not currently exported from the root, so we have to get the plugin from the config.
// https://github.com/eslint-community/eslint-plugin-eslint-comments/issues/215
const ESLintPluginESLintComments =
  ESLintPluginESLintCommentsConfigs.recommended.plugins['@eslint-community/eslint-comments'];

export default tseslint.config(
  // completely ignored files
  {
    name: 'custom:ignores',
    ignores: ['vitest.workspace.ts', 'dist', 'node_modules', 'vite-env.d.ts'],
  },

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

  {
    name: 'custom:eslint-comments',
    plugins: {
      '@eslint-community/eslint-comments': ESLintPluginESLintComments,
    },
    rules: {
      '@eslint-community/eslint-comments/require-description': ['error', { ignore: [] }],
    },
  },

  {
    name: 'custom:react-plugins',
    languageOptions: { parserOptions: { ecmafeatures: { jsx: true } } },
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
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react/jsx-no-useless-fragment': [
        'error',
        {
          allowExpressions: true,
        },
      ],
      'react-refresh/only-export-components': 'off',
    },
  },

  {
    name: 'custom:import-enabled',
    plugins: { import: fixupPluginRules(import_) },
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
            { pattern: '@penumbra-zone/**', group: 'internal', position: 'before' },
            { pattern: '@repo/**', group: 'internal', position: 'after' },

            { pattern: '@buf/**', group: 'external', position: 'after' },
            { pattern: '@penumbra-labs/**', group: 'external', position: 'after' },
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
      '@typescript-eslint/no-non-null-assertion': 'error',

      // '@typescript-eslint/no-redeclare': 'error',
      // '@typescript-eslint/no-shadow': 'error',
      // '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },

  {
    name: 'custom:eslint-wishlist-improvements',
    rules: {
      'no-bitwise': 'error',
      'no-console': ['error', { allow: ['warn', 'error', 'debug'] }],
      'no-nested-ternary': 'warn',
      'no-param-reassign': 'error',
      'no-promise-executor-return': ['error', { allowVoid: true }],
      'no-restricted-globals': [
        'error',
        { message: 'Use `globalThis` instead.', name: 'global' },
        { message: 'Use `globalThis` instead.', name: 'self' },
      ],
      'no-self-assign': ['error', { props: true }],
      'no-template-curly-in-string': 'warn',
      'no-unreachable-loop': 'warn',
      'no-warning-comments': 'off',
      'prefer-regex-literals': ['error', { disallowRedundantWrapping: true }],
      'spaced-comment': ['error', 'always', { markers: ['/'] }],
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
      'no-console': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      'react/display-name': 'off',
      '@eslint-community/eslint-comments/require-description': 'off',
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

  {
    name: 'custom:prettier-would-disable',
    rules: { curly: ['error', 'all'] },
  },
);
