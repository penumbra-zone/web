import { createTheme } from '@mui/system';

declare module '@mui/system' {
  // Customize breakpoints as per
  // https://mui.com/material-ui/customization/breakpoints/#custom-breakpoints
  interface BreakpointOverrides {
    // Turn off names we don't want
    xs: false;
    sm: false;
    md: false;

    // Turn on names we do
    mobile: true;
    tablet: true;
    desktop: true;
    lg: true;
    xl: true;
  }
}

export const theme = createTheme({
  breakpoints: {
    values: {
      mobile: 0,
      tablet: 600,
      desktop: 900,
      lg: 1200,
      xl: 1600,
    },
  },
  palette: {
    neutral: {
      100: '#f5f5f5',
      400: '#a3a3a3',
      700: '#404040',
    },
  },
  spacing: 4,
  typography: {
    h1: {
      fontFamily: 'Work Sans',
      fontSize: '3.75rem',
      fontWeight: 500,
      // lineHeight:
    },
    // fonts: {
    //   default: 'Poppins',
    //   mono: 'Iosevka Term, monospace',
    //   heading: 'Work Sans',
    // },
    // fontSizes: {
    //   text9xl: '8rem',
    //   text8xl: '6rem',
    //   text7xl: '4.5rem',
    //   text6xl: '3.75rem',
    //   text5xl: '3rem',
    //   text4xl: '2.25rem',
    //   text3xl: '1.875rem',
    //   text2xl: '1.5rem',
    //   textXl: '1.25rem',
    //   textLg: '1.125rem',
    //   textBase: '1rem',
    //   textSm: '0.875rem',
    //   textXs: '0.75rem',
    // },
  },
});
