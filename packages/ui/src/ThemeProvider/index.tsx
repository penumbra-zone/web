import { ThemeProvider as ThemeProviderPrimitive } from 'styled-components';
import { theme } from './theme';
import { PropsWithChildren } from 'react';
import { FontFaces } from './FontFaces';

export const ThemeProvider = ({ children }: PropsWithChildren) => (
  <ThemeProviderPrimitive theme={theme}>
    <FontFaces />

    {children}
  </ThemeProviderPrimitive>
);
