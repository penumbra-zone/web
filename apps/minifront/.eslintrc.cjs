module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: ['custom'],
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
};
