import type { Config } from 'tailwindcss';
import { tailwindConfig } from './src/theme/tailwind-config'; // Assumes this path is correct relative to the new file

// This configuration is specifically for generating CSS with a 'v2-' prefix.
export default {
  prefix: 'v2-',
  content: ['./src/**/*.{tsx,ts}'], // It scans the same source files (which use unprefixed classes)
  theme: tailwindConfig.theme,
} satisfies Config; 