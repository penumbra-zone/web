'use client';

import { ReactNode } from 'react';
import { PenumbraUIProvider } from '@penumbra-zone/ui/PenumbraUIProvider';
import { Display } from '@penumbra-zone/ui/Display';
import { Header } from '@/components/header';

const V2Layout = ({ children }: { children: ReactNode }) => {
  return (
    <PenumbraUIProvider>
      <Display>
        <Header />
        {children}
      </Display>
    </PenumbraUIProvider>
  )
};

export default V2Layout;
