import type { Config } from 'tailwindcss';
import { tailwindConfig } from './src/theme/tailwind-config';

export default {
  content: ['./src/**/*.{tsx,ts}'],
  theme: tailwindConfig.theme,
} satisfies Config;
