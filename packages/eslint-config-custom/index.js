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
    'tailwindcss/classnames-order': 'warn',
    'tailwindcss/no-custom-classname': [
      'error',
      {
        whitelist: [
          'bg\\-card-radial',
          'text\\-teal',
          'bg\\-charcoal',
          'text\\-muted-foreground',
          'ring\\-offset-background',
          'ring\\-ring',
          'border\\-input',
          'bg\\-teal',
          'bg\\-accent',
          'text\\-accent-foreground',
          'bg\\-background',
          'border\\-teal',
          'bg\\-teal/80',
          'text\\-primary-foreground',
          'bg\\-destructive',
          'text\\-destructive-foreground',
          'bg\\-destructive/90',
          'text\\-primary'
        ],
      },
    ],
    'tailwindcss/no-contradicting-classname': 'error',
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
