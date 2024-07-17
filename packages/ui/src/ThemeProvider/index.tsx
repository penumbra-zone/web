import { ThemeProvider as ThemeProviderPrimitive } from 'styled-components';
import { theme } from './theme';
import { PropsWithChildren } from 'react';
import { FontFaces } from './FontFaces';

/**
 * Place at the root of your app, above all Penumbra UI components, to provide
 * the theme values that they use.
 */
export const ThemeProvider = ({ children }: PropsWithChildren) => (
  <ThemeProviderPrimitive theme={theme}>
    <FontFaces />

    {children}
  </ThemeProviderPrimitive>
);
