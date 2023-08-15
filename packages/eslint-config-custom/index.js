module.exports = {
  extends: [
    'prettier',
    'next/core-web-vitals',
    'eslint:recommended',
    'next',
    'turbo',
    'plugin:tailwindcss/recommended',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
  ],
  plugins: ['@typescript-eslint', 'turbo'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
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
