// eslint-disable-next-line -- ignore
import config from '../../eslint.config.js';
import tailwindcss from 'eslint-plugin-tailwindcss';
import { resolve } from 'node:path';

config.push({
  name: 'custom:tailwindcss-config',
  plugins: { tailwindcss },
  settings: {
    tailwindcss: {
      config: resolve('tailwind.config.ts'),
    },
  },
  rules: {
    ...tailwindcss.configs.recommended.rules,
    'tailwindcss/no-custom-classname': ['error', { callees: ['cn', 'cva', 'clsx'] }],
  },
});

export default config;
