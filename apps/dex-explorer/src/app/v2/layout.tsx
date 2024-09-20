'use client';

import { ReactNode } from 'react';
import { PenumbraUIProvider } from '@penumbra-zone/ui/PenumbraUIProvider';

const V2Layout = ({ children }: { children: ReactNode }) => {
  return (
    <PenumbraUIProvider>
      {children}
    </PenumbraUIProvider>
  )
};

export default V2Layout;
