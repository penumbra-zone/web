// Inspired by: https://github.com/vercel/avatar

import color from 'tinycolor2';
import djb2a from 'djb2a';

// Deterministically getting a gradient from a string for use as an identicon
export const generateGradient = (str: string) => {
  // Get first color
  const hash = djb2a(str);
  const c = color({ h: hash % 360, s: 0.95, l: 0.5 });

  const tetrad = c.tetrad(); // 4 colors spaced around the color wheel, the first being the input
  const secondColorOptions = tetrad.slice(1);
  const index = hash % 3;
  const toColor = secondColorOptions[index]!.toHexString();

  return {
    fromColor: c.toHexString(),
    toColor,
  };
};

export const generateColor = (str: string) => {
  // Get color
  const hash = djb2a(str);
  const c = color({ h: hash % 360, s: 0.95, l: 0.5 })
    .saturate(0)
    .darken(20);

  return {
    bg: c.toHexString(),
    // get readable text color
    text: color
      .mostReadable(c, ['white', 'black'], {
        includeFallbackColors: true,
        level: 'AAA',
        size: 'small',
      })
      .saturate()
      .darken(20)
      .toHexString(),
  };
};
