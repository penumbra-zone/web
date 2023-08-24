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
    'tailwindcss/no-custom-classname': [
      'warn',
      {
        whitelist: [
          'bg\\-(card-radial|charcoal|teal|accent|background|teal/80|destructive|destructive/90)',
          'text\\-(muted-foreground|accent-foreground|primary-foreground|destructive-foreground|primary|teal)',
          'ring\\-(offset-background|ring)',
          'border\\-(input|teal)',
        ],
      },
    ],
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
