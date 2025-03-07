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

export default [
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
