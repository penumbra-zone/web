/**
 * Used for reference in the `theme` object below. Not intended to be used
 * directly by consumers, but rather as a semantic reference for building the
 * theme.
 */
const PALETTE = {
  green: {
    50: '#f0fdf4',
    100: '#DEFAE8',
    200: '#BFF3D1',
    300: '#8DE8AE',
    400: '#55D383',
    500: '#2DBA61',
    600: '#1F9A4C',
    700: '#1C793F',
    800: '#1C5F36',
    900: '#194E2E',
    950: '#03160B',
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  orange: {
    50: '#FFF8ED',
    100: '#FDEED6',
    200: '#FBDBAD',
    300: '#F8C079',
    400: '#F49C43',
    500: '#F07E1C',
    600: '#E16615',
    700: '#BA4D14',
    800: '#933E19',
    900: '#773517',
    950: '#200B04',
  },
  purple: {
    50: '#FAF7FC',
    100: '#F5F0F7',
    200: '#E9E0EE',
    300: '#D8C7E0',
    400: '#C1A6CC',
    500: '#A582B3',
    600: '#886693',
    700: '#705279',
    800: '#5F4766',
    900: '#4F3C53',
    950: '#180E1B',
  },
  red: {
    50: '#fef2f2',
    100: '#FCE4E4',
    200: '#FBCDCD',
    300: '#F8A9A9',
    400: '#F17878',
    500: '#E54E4E',
    600: '#CF3333',
    700: '#AF2626',
    800: '#902424',
    900: '#772525',
    950: '#1E0606',
  },
  teal: {
    50: '#f1fcfa',
    100: '#D4F3EE',
    200: '#92DFD5',
    300: '#77D1C8',
    400: '#53AEA8',
    500: '#319B96',
    600: '#257C79',
    700: '#226362',
    800: '#204F4F',
    900: '#1F4242',
    950: '#031516',
  },
  yellow: {
    50: '#FDFCE9',
    100: '#FBF7C6',
    200: '#F8EB90',
    300: '#F4DA50',
    400: '#E8C127',
    500: '#DDAD15',
    600: '#C0860E',
    700: '#99610F',
    800: '#7E4D15',
    900: '#6B3F18',
    950: '#201004',
  },
};

const FIFTEEN_PERCENT_OPACITY_IN_HEX = '26';
const EIGHTY_PERCENT_OPACITY_IN_HEX = 'cc';

export const theme = {
  blur: {
    none: '0px',
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '32px',
    xl: '64px',
  },
  borderRadius: {
    none: '0px',
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    full: '9999px',
  },
  breakpoint: {
    mobile: 0,
    tablet: 600,
    desktop: 900,
    lg: 1200,
    xl: 1600,
  },
  color: {
    neutral: {
      main: PALETTE.neutral['700'],
      light: PALETTE.neutral['400'],
      dark: PALETTE.neutral['900'],
      contrast: PALETTE.neutral['50'],
    },
    primary: {
      main: PALETTE.orange['700'],
      light: PALETTE.orange['400'],
      dark: PALETTE.orange['950'],
      contrast: PALETTE.orange['50'],
    },
    secondary: {
      main: PALETTE.teal['700'],
      light: PALETTE.teal['400'],
      dark: PALETTE.teal['950'],
      contrast: PALETTE.teal['50'],
    },
    unshield: {
      main: PALETTE.purple['700'],
      light: PALETTE.purple['400'],
      dark: PALETTE.purple['950'],
      contrast: PALETTE.purple['50'],
    },
    destructive: {
      main: PALETTE.red['700'],
      light: PALETTE.red['400'],
      dark: PALETTE.red['950'],
      contrast: PALETTE.red['50'],
    },
    caution: {
      main: PALETTE.yellow['700'],
      light: PALETTE.yellow['400'],
      dark: PALETTE.yellow['950'],
      contrast: PALETTE.yellow['50'],
    },
    success: {
      main: PALETTE.green['700'],
      light: PALETTE.green['400'],
      dark: PALETTE.green['950'],
      contrast: PALETTE.green['50'],
    },
    base: {
      black: '#000',
      white: '#fff',
      transparent: 'transparent',
    },
    text: {
      primary: PALETTE.neutral['50'],
      secondary: PALETTE.neutral['300'],
      disabled: PALETTE.neutral['500'],
      special: PALETTE.orange['400'],
    },
    action: {
      hoverOverlay: PALETTE.neutral['50'] + FIFTEEN_PERCENT_OPACITY_IN_HEX,
      activeOverlay: PALETTE.neutral['950'] + FIFTEEN_PERCENT_OPACITY_IN_HEX,
      disabledOverlay: PALETTE.neutral['950'] + EIGHTY_PERCENT_OPACITY_IN_HEX,
      primaryFocusOutline: PALETTE.orange['400'],
      secondaryFocusOutline: PALETTE.teal['400'],
      unshieldFocusOutline: PALETTE.purple['400'],
      neutralFocusOutline: PALETTE.neutral['400'],
      destructiveFocusOutline: PALETTE.red['400'],
    },
    other: {
      tonalStroke: PALETTE.neutral['50'] + FIFTEEN_PERCENT_OPACITY_IN_HEX,
      solidStroke: PALETTE.neutral['700'],
    },
  },
  font: {
    default: 'Poppins',
    mono: 'Iosevka Term, monospace',
    heading: 'Work Sans',
  },
  fontSize: {
    text9xl: '8rem',
    text8xl: '6rem',
    text7xl: '4.5rem',
    text6xl: '3.75rem',
    text5xl: '3rem',
    text4xl: '2.25rem',
    text3xl: '1.875rem',
    text2xl: '1.5rem',
    textXl: '1.25rem',
    textLg: '1.125rem',
    textBase: '1rem',
    textSm: '0.875rem',
    textXs: '0.75rem',
  },
  lineHeight: {
    text9xl: '8.25rem',
    text8xl: '6.25rem',
    text7xl: '5rem',
    text6xl: '4.25rem',
    text5xl: '3.5rem',
    text4xl: '2.75rem',
    text3xl: '2.5rem',
    text2xl: '2.25rem',
    textXl: '2rem',
    textLg: '1.75rem',
    textBase: '1.5rem',
    textSm: '1.25rem',
    textXs: '1rem',
  },
  spacing: (spacingUnits: number) => `${spacingUnits * 4}px`,
  zIndex: {
    dialogOverlay: 1000,
    dialogContent: 1001,
  },
} as const;

type Theme = typeof theme;
export type Color = keyof Theme['color'];
export type ColorVariant = keyof Theme['color']['neutral'];
export type TextColorVariant = keyof Theme['color']['text'];

/**
 * Merge styled-components' `DefaultTheme` interface with our interface above.
 * Since we're defining this in a code file that consumers of PenumbraUI will
 * import, they'll get the updated theme typings as well.
 */
declare module 'styled-components' {
  // We're doing a declaration merge here, so the interface will be empty.
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends Theme {}
}
