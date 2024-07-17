import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
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
  }
}
