import eslintConfig from 'prax-configs/eslint';
import tailwindcss from 'eslint-plugin-tailwindcss';
import { createRequire } from 'node:module';

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
];
