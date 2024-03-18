module.exports = {
  root: true,
  extends: ['../../.eslintrc.cjs', 'plugin:storybook/recommended'],
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
};
