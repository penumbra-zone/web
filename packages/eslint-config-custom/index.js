module.exports = {
  extends: [
    'prettier',
    'eslint:recommended',
    'turbo',
    'plugin:tailwindcss/recommended',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:vitest/recommended',
  ],
  plugins: ['@typescript-eslint', 'turbo', 'vitest'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
  },
  parserOptions: {
    babelOptions: {
      presets: [require.resolve('next/babel')],
    },
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
};
