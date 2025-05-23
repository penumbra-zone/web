import { withPenumbra } from '@penumbra-zone/ui/theme';

export default withPenumbra({
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx,css}',
    './pages/**/*.{js,ts,jsx,tsx,mdx,css}',
    './shared/**/*.{js,ts,jsx,tsx,mdx,css}',
    './featured/**/*.{js,ts,jsx,tsx,mdx,css}',
    './widgets/**/*.{js,ts,jsx,tsx,mdx,css}',
    './entities/**/*.{js,ts,jsx,tsx,mdx,css}',
  ],
  theme: {},
  plugins: [],
});
