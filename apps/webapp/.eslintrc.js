export default {
  root: true,
  env: { browser: true, es2020: true },
  extends: ['custom'],
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
};
