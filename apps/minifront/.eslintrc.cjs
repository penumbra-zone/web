module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: ['../../.eslintrc.cjs'],
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
};
