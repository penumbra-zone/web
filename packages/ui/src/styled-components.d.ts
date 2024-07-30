import 'styled-components';

interface ColorVariants {
  main: string;
  light: string;
  dark: string;
  contrast: string;
}

declare module 'styled-components' {
  export interface DefaultTheme {
    blur: {
      none: string;
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    borderRadius: {
      none: string;
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      full: string;
    };
    color: {
      neutral: ColorVariants;
      primary: ColorVariants;
      secondary: ColorVariants;
      unshield: ColorVariants;
      destructive: ColorVariants;
      caution: ColorVariants;
      success: ColorVariants;

      // Special cases

      base: {
        black: string;
        white: string;
        transparent: string;
      };

      text: {
        primary: string;
        secondary: string;
        disabled: string;
        special: string;
      };

      action: {
        hoverOverlay: string;
        activeOverlay: string;
        disabledOverlay: string;
        primaryFocusOutline: string;
        secondaryFocusOutline: string;
        unshieldFocusOutline: string;
        neutralFocusOutline: string;
        destructiveFocusOutline: string;
      };

      other: {
        tonalStroke: string;
        solidStroke: string;
      };
    };
    breakpoint: {
      mobile: number;
      tablet: number;
      desktop: number;
      lg: number;
      xl: number;
    };
    font: {
      default: string;
      mono: string;
      heading: string;
    };
    fontSize: {
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
    lineHeight: {
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
    /**
     * A function that takes a number of spacing units, and returns a string to
     * use for a CSS property.
     */
    spacing: (spacingUnits: number) => string;
    zIndex: {
      dialogOverlay: number;
      dialogContent: number;
    };
  }
}
