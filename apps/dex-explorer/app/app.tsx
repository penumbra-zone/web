'use client';

import { ReactNode } from 'react';
import { enableStaticRendering } from 'mobx-react-lite';
import { QueryClientProvider } from '@tanstack/react-query';
import { PenumbraUIProvider } from '@penumbra-zone/ui/PenumbraUIProvider';
import { Display } from '@penumbra-zone/ui/Display';
import { Header, SyncBar } from '@/widgets/header';
import { queryClient } from '@/shared/const/queryClient';
import { StyledComponentsRegistry } from './StyleRegistry';

// Used so that observer() won't subscribe to any observables used in an SSR environment
// and no garbage collection problems are introduced.
enableStaticRendering(typeof window === 'undefined');

export const App = ({ children }: { children: ReactNode }) => {
  return (
    <StyledComponentsRegistry>
      <PenumbraUIProvider>
        <QueryClientProvider client={queryClient}>
          <Display>
            <SyncBar />
            <Header />
            {children}
          </Display>
        </QueryClientProvider>
      </PenumbraUIProvider>
    </StyledComponentsRegistry>
  );
};
