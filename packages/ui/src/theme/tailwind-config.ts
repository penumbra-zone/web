import type { Config } from 'tailwindcss';
import { theme } from './theme';

/**
 * For consumers using Tailwind, this file exports a Tailwind config based on
 * the Penumbra UI theme values.
 */
export const tailwindConfig = {
  content: ['./node_modules/@penumbra-zone/ui/**/*.{js,ts,jsx,tsx,mdx,css}'],
  theme: {
    extend: {
      borderRadius: theme.borderRadius,
      colors: theme.color,
      fontFamily: theme.font,
      fontSize: theme.fontSize,
      lineHeight: theme.lineHeight,
      backdropBlur: theme.blur,
      backgroundImage: theme.gradient,
      keyframes: theme.keyframes,
      animation: theme.animation,
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
} as const;

const composeContent = (content: Config['content']): Config['content'] => {
  if (typeof content === 'string') {
    return [...tailwindConfig.content, content];
  }

  if (Array.isArray(content)) {
    return [...tailwindConfig.content, ...content];
  }

  content.files.push(...tailwindConfig.content);
  return content;
};

/**
 * Wrap your Tailwind config with `withPenumbra` function to support Penumbra classes
 * and styles of the `@penumbra-zone/ui` library.
 */
export const withPenumbra = (config: Config): Config => {
  return {
    ...config,
    content: composeContent(config.content),
    theme: {
      ...config.theme,
      extend: {
        ...tailwindConfig.theme.extend,
        ...config.theme?.extend,
      },
    },
  };
};
