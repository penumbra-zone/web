import { tailwindConfig as v2TailwindConfig } from '@penumbra-zone/ui/tailwind';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx,css}'],
  theme: v2TailwindConfig.theme,
  plugins: [],
};
