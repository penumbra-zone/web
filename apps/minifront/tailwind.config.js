import sharedConfig from '@repo/tailwind-config';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [sharedConfig],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}', // Minifront's own components and pages
    '../../packages/ui-deprecated/src/**/*.{js,ts,jsx,tsx}', // ui-deprecated src
    '../../packages/ui-deprecated/components/**/*.{js,ts,jsx,tsx}', // ui-deprecated components
  ],
};
