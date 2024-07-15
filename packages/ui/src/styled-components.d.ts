import 'styled-components';

interface Colors {
  main: string;
  light: string;
  dark: string;
  contrast: string;
}

declare module 'styled-components' {
  export interface DefaultTheme {
    breakpoints: {
      mobile: number;
      tablet: number;
      desktop: number;
      lg: number;
      xl: number;
    };
    fonts: {
      default: string;
      mono: string;
      heading: string;
    };
    fontSizes: {
      text9xl: string;
      text8xl: string;
      text7xl: string;
      text6xl: string;
      text5xl: string;
      text4xl: string;
      text3xl: string;
      text2xl: string;
      textXl: string;
      textLg: string;
      textBase: string;
      textSm: string;
      textXs: string;
    };
    colors: {
      neutral: Colors;
      primary: Colors;
      secondary: Colors;
      unshield: Colors;
      destructive: Colors;
      caution: Colors;
      success: Colors;

      // Special cases

      text: {
        primary: string;
        secondary: string;
        disabled: string;
        special: string;
      };
    };
    /**
     * A function that takes a number of spacing units, and returns a string to
     * use for a CSS property.
     */
    spacing: (spacingUnits: number) => string;
  }
}
