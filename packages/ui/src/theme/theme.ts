/**
 * Stub object to be used only in typing.
 * DON'T USE IT TO STYLE YOUR COMPONENTS.
 */
export const theme = {
  breakpoint: {
    mobile: 0,
    tablet: 600,
    desktop: 900,
    lg: 1200,
    xl: 1600,
  },
  color: {
    neutral: {
      main: '',
      light: '',
      dark: '',
      contrast: '',
    },
    primary: {
      main: '',
      light: '',
      dark: '',
      contrast: '',
    },
    secondary: {
      main: '',
      light: '',
      dark: '',
      contrast: '',
    },
    unshield: {
      main: '',
      light: '',
      dark: '',
      contrast: '',
    },
    destructive: {
      main: '',
      light: '#f17878',
      dark: '',
      contrast: '',
    },
    caution: {
      main: '',
      light: '',
      dark: '',
      contrast: '',
    },
    success: {
      main: '',
      light: '#55d383',
      dark: '',
      contrast: '',
    },
    base: {
      black: '',
      blackAlt: '',
      white: '',
      transparent: '',
    },
    text: {
      primary: '#fafafa',
      secondary: '',
      muted: '',
      special: '',
    },
    action: {
      hoverOverlay: '',
      activeOverlay: '',
      disabledOverlay: '',
      primaryFocusOutline: '',
      secondaryFocusOutline: '',
      unshieldFocusOutline: '',
      neutralFocusOutline: '',
      destructiveFocusOutline: '',
      successFocusOutline: '',
    },
    other: {
      tonalStroke: '#fafafa26',
      tonalFill5: '',
      tonalFill10: '',
      solidStroke: '',
      dialogBackground: '',
      overlay: '',
      orangeOutline: '',
      neutralOutline: '',
    },
  },
} as const;

type Theme = typeof theme;
export type Color = keyof Theme['color'];
export type ColorVariant = keyof Theme['color']['neutral'];
export type TextColorVariant = keyof Theme['color']['text'];
