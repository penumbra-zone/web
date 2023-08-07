module.exports = {
  extends: [
    'prettier',
    'next/core-web-vitals',
    'eslint:recommended',
    'next',
    'turbo',
    'plugin:tailwindcss/recommended',
  ],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
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
};
