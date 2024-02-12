module.exports = {
  extends: [
    'prettier',
    'eslint:recommended',
    'turbo',
    'plugin:tailwindcss/recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:vitest/recommended',
    'plugin:react-hooks/recommended',
  ],
  plugins: ['@typescript-eslint', 'turbo', 'vitest', 'react-refresh'],
  rules: {
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
    react: { version: 'detect' },
  },
};
