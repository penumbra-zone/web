'use client';

import { useState, ReactNode } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';
import { tailwindConfig } from '@penumbra-zone/ui/tailwind';

/** Enables using the color functions in Text UI components */
declare module 'styled-components' {
  export interface DefaultTheme {
    color: (typeof tailwindConfig)['theme']['extend']['colors'];
  }
}

/**
 * Needed to ensure that styled-components styles are rendered on the server.
 * https://nextjs.org/docs/app/building-your-application/styling/css-in-js#styled-components
 */
export const StyledComponentsRegistry = ({ children }: { children: ReactNode }) => {
  // Only create stylesheet once with lazy initial state
  // x-ref: https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  if (typeof window !== 'undefined') {
    return <>{children}</>;
  }

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>{children}</StyleSheetManager>
  );
};
