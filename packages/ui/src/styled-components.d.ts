import 'styled-components';

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
    palette: {
      neutral: {
        100: string;
        400: string;
        700: string;
      };
    };
    /**
     * A function that takes a number of spacing units, and returns a string to
     * use for a CSS property.
     */
    spacing: (spacingUnits: number) => string;
  }
}
