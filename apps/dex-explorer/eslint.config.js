import eslintConfig from 'configs/eslint';
import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'url';
import path from 'path';

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const excludePlugins = eslintConfig.flatMap(config => Object.keys(config.plugins || {}));

const config = [
  ...compat
    .extends('next/core-web-vitals')
    .filter(config =>
      Object.keys(config.plugins || {}).every(plugin => !excludePlugins.includes(plugin)),
    ),

  ...eslintConfig.filter(config => config.name !== 'custom:turbo-config'),

  {
    name: 'ignore-old-ts-files',
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
];

/**
 * The next block of code is a workaround that enables the outdated eslint config in the DEX code.
 * In the future, we must bring the ESLint config to the repo and keep the dependencies up to date.
 * TODO: Remove this workaround when the ESLint config is moved to the repo.
 */
const IGNORE_RULES = ['@typescript-eslint/dot-notation', '@typescript-eslint/no-empty-function'];
config.forEach(option => {
  IGNORE_RULES.forEach(rule => {
    if (option.rules?.[rule]) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- required here
      delete option.rules[rule];
    }
  });
});

export default config;
