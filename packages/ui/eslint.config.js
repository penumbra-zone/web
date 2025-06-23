// eslint-disable-next-line -- ignore
import config from '../../eslint.config.js';
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss';
import { resolve } from 'node:path';

config.push({
  name: 'custom:tailwindcss-config',
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  plugins: {
    'better-tailwindcss': eslintPluginBetterTailwindcss,
  },
  settings: {
    'better-tailwindcss': {
      entryPoint: resolve('./src/theme/theme.css'),
    },
  },
  rules: {
    ...eslintPluginBetterTailwindcss.configs['recommended-error'].rules,
    'better-tailwindcss/enforce-consistent-line-wrapping': 0,
    'better-tailwindcss/no-unregistered-classes': [
      'error',
      { ignore: ['scroll-area-page', 'scroll-area-component'] },
    ],
  },
});

export default config;
