module.exports = {
  root: true,
  extends: ['custom', 'plugin:storybook/recommended'],
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
};
