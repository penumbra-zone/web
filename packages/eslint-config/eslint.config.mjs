import { createRequire } from 'node:module';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import { fixupConfigRules } from '@eslint/compat';
import importPlugin from 'eslint-plugin-import';
import tailwindPlugin from 'eslint-plugin-tailwindcss';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import turboPlugin from 'eslint-plugin-turbo';
import vitestPlugin from 'eslint-plugin-vitest';
import storybookPlugin from 'eslint-plugin-storybook';

const require = createRequire(import.meta.url);

export const penumbraEslintConfig = {
  extends: [
    eslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    prettierRecommended,
    ...fixupConfigRules(reactRecommended), // use reactPlugin.config.recommended when plugin is v9.0 ready
  ],
  plugins: {
    import: importPlugin,
    tailwindcss: tailwindPlugin,
    turbo: turboPlugin,
    vitest: vitestPlugin,
    storybook: storybookPlugin,
  },
  ignores: ['**/*.js'],
  settings: {
    'import/resolver': {
      typescript: true,
    },
    react: { version: 'detect' },
    tailwindcss: {
      // Ensures that ESLint knows about our Tailwind config, such as color
      // names, etc. Without this, ESLint integrations (such as with the VSCode
      // extension) break.
      //
      // @see https://github.com/microsoft/vscode-eslint/issues/1706#issuecomment-1916389417
      config: require.resolve('@penumbra-zone/tailwind-config'),
    },
  },
  rules: {
    ...tailwindPlugin.configs.recommended.rules,
    ...vitestPlugin.configs.recommended.rules,
    ...storybookPlugin.configs.recommended.rules,
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'turbo/no-undeclared-env-vars': 'error',
    'import/no-useless-path-segments': ['error', { noUselessIndex: true }],
    'import/no-relative-packages': 'error',
    'import/no-self-import': 'error',
    'import/first': 'error',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never',
        tsx: 'never',
        mts: 'never,',
        js: 'never',
        jsx: 'never',
        mjs: 'never',
      },
    ],
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    '@typescript-eslint/no-unnecessary-condition': ['error', { allowConstantLoopConditions: true }],
    '@typescript-eslint/no-invalid-void-type': 'off',
    '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    // Catches untyped let declarations
    'no-restricted-syntax': [
      'error',
      {
        selector:
          "VariableDeclaration[kind = 'let'] > VariableDeclarator[init = null]:not([id.typeAnnotation])",
        message: 'Type must be annotated at variable declaration',
      },
    ],
    'tailwindcss/no-custom-classname': [
      'error',
      {
        // All of these callees are the Tailwind defaults, except `cn`, which is
        // our own custom helper.
        callees: ['classnames', 'clsx', 'cn', 'ctl', 'cva', 'tv'],
        // When adding more items to the allow list, please document the reason.
        whitelist: [
          // Used by Sonner
          'toaster',
        ],
      },
    ],
  },
};
