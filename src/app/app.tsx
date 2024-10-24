'use client';

import { ReactNode } from 'react';
import { enableStaticRendering } from 'mobx-react-lite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PenumbraUIProvider } from '@penumbra-zone/ui/PenumbraUIProvider';
import { Display } from '@penumbra-zone/ui/Display';
import { SyncBar } from '@/components/header/sync-bar';
import { Header } from '@/components/header';
import { StyledComponentsRegistry } from './StyleRegistry';

const queryClient = new QueryClient();

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
