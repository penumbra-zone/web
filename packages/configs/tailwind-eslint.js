import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss';
import config from './eslint.config.js';

const createConfig = path => {
  return [
    ...config,
    {
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
          entryPoint: path,
        },
      },
      rules: {
        ...eslintPluginBetterTailwindcss.configs['recommended-error'].rules,
        'better-tailwindcss/enforce-consistent-line-wrapping': 0,
        'better-tailwindcss/no-unregistered-classes': [
          'error',
          {
            ignore: [
              'scroll-area-page',
              'scroll-area-component',
              'text-textXs',
              'text-textSm',
              'text-textBase',
              'text-textLg',
              'text-textXl',
              'text-text2xl',
              'text-text3xl',
              'text-text4xl',
              'text-text5xl',
              'text-text6xl',
              'text-text7xl',
              'text-text8xl',
              'text-text9xl',
            ],
          },
        ],
      },
    },
  ];
};

export default createConfig;
