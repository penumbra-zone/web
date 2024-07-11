import { ThemeProvider as ThemeProviderPrimitive } from '@mui/system';
import { theme } from './theme';
import { PropsWithChildren } from 'react';
// import { GlobalStyles } from './GlobalStyles';

export const ThemeProvider = ({ children }: PropsWithChildren) => (
  <ThemeProviderPrimitive theme={theme}>
    {/* <GlobalStyles /> */}

    {children}
  </ThemeProviderPrimitive>
);
