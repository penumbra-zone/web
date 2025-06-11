import { withPenumbra, tailwindConfig } from '@penumbra-zone/ui/theme';

export default withPenumbra({
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx,css}',
    './app/**/*.{js,ts,jsx,tsx,mdx,css}',
    './pages/**/*.{js,ts,jsx,tsx,mdx,css}',
    './shared/**/*.{js,ts,jsx,tsx,mdx,css}',
    './featured/**/*.{js,ts,jsx,tsx,mdx,css}',
    './widgets/**/*.{js,ts,jsx,tsx,mdx,css}',
    './entities/**/*.{js,ts,jsx,tsx,mdx,css}',
    // Include UI package components
    '../../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx,css}',
  ],
  theme: {
    extend: {
      ...tailwindConfig.theme.extend,
      backgroundImage: {
        ...tailwindConfig.theme.extend.backgroundImage,
        // Add the gradient backgrounds that TransactionView expects
        gradientAccentRadial:
          'radial-gradient(100% 100% at 0% 0%, rgba(244, 156, 67, 0.25) 0%, rgba(244, 156, 67, 0.03) 100%)',
        gradientUnshieldRadial:
          'radial-gradient(100% 100% at 0% 0%, rgba(193, 166, 204, 0.25) 0%, rgba(193, 166, 204, 0.03) 100%)',
        cardGradient:
          'linear-gradient(136deg, rgba(250, 250, 250, 0.1) 6.32%, rgba(250, 250, 250, 0.01) 75.55%)',
      },
    },
  },
  plugins: [],
});
