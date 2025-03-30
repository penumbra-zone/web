import eslintConfig from '@penumbra-zone/configs/eslint';
import { createRequire } from 'node:module';
import tailwindcss from 'eslint-plugin-tailwindcss';

export default [
  ...eslintConfig,
  // tailwind config
  {
    name: 'custom:tailwindcss-config',
    plugins: { tailwindcss },
    settings: {
      tailwindcss: { config: createRequire(import.meta.url).resolve('@repo/tailwind-config') },
    },
    rules: {
      ...tailwindcss.configs.recommended.rules,
      'tailwindcss/no-custom-classname': ['error', { callees: ['cn', 'cva'] }],
    },
  },
  // Rules to ignore variables that start with underscore
  {
    name: 'custom:unused-vars-config',
    rules: {
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-unused-vars': ['error', {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        caughtErrors: 'none'
      }],
    },
  },
];
