module.exports = {
  extends: ['prettier', 'next/core-web-vitals', 'eslint:recommended', 'next', 'turbo'],
  rules: {},
  parserOptions: {
    babelOptions: {
      presets: [require.resolve('next/babel')],
    },
  },
};
