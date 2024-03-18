module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `eslint-config-custom`
  extends: [
    'custom',
    'prettier',
    'eslint:recommended',
    'turbo',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:tailwindcss/recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:vitest/recommended',
    'plugin:react-hooks/recommended',
  ],
  plugins: ['@typescript-eslint', 'turbo', 'vitest', 'react-refresh'],
  rules: {
    'import/extensions': [
      'error',
      'always',
      {
        ts: 'never',
        tsx: 'never',
        mts: 'never,',
        js: 'never',
        jsx: 'never',
        mjs: 'never',
      },
    ],
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'import/no-useless-path-segments': ['error', { noUselessIndex: true }],
    'import/no-relative-packages': 'error',
    'import/no-self-import': 'error',
    'import/first': 'error',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    '@typescript-eslint/no-unnecessary-condition': ['error', { allowConstantLoopConditions: true }],
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
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js'],
      parser: '@typescript-eslint/parser',
    },
  ],
  env: {
    webextensions: true,
  },
  ignorePatterns: ['dist/*'],
  settings: {
    next: {
      rootDir: ['apps/*/'],
    },
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
};
