import sharedConfig from '@repo/tailwind-config';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [sharedConfig],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}', // Minifront's own components and pages
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}', // @penumbra-zone/ui components
    // If you use other local packages that expose Tailwind classes, add them here, e.g.:
    // '../../packages/ui-deprecated/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
};
