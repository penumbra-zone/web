import { ThemeProvider as ThemeProviderPrimitive } from 'styled-components';
import { theme } from './theme';
import { PropsWithChildren } from 'react';
import { FontFaces } from './FontFaces';
import { MotionConfig } from 'framer-motion';

/**
 * Place at the root of your app, above all Penumbra UI components, to provide
 * a number of context values that they use.
 */
export const PenumbraUIProvider = ({ children }: PropsWithChildren) => (
  <ThemeProviderPrimitive theme={theme}>
    <MotionConfig transition={{ duration: 0.15 }}>
      <FontFaces />

      {children}
    </MotionConfig>
  </ThemeProviderPrimitive>
);
