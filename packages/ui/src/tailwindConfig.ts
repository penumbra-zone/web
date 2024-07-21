import { Config } from 'tailwindcss';
import { theme } from './ThemeProvider/theme';
import { RecursiveKeyValuePair, ResolvableTo } from 'tailwindcss/types/config';

/**
 * For consumers using Tailwind, this file exports a Tailwind config based on
 * the Penumbra UI theme values.
 */
export const tailwindConfig: Config = {
  content: [],
  theme: {
    extend: {
      borderRadius: theme.borderRadius,
      colors: theme.color as unknown as ResolvableTo<RecursiveKeyValuePair>,
      fontFamily: theme.font,
      fontSize: theme.fontSize,
      lineHeight: theme.lineHeight,
      screens: Object.keys(theme.breakpoint).reduce(
        (prev, curr) => ({
          ...prev,
          [curr]: theme.breakpoint[curr as keyof (typeof theme)['breakpoint']].toString() + 'px',
        }),
        {},
      ),

      // No need to customize spacing, since Tailwind's default is the same as
      // Penumbra UI's.
    },
  },
};
