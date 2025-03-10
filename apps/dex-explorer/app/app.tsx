'use client';

import { ReactNode, useEffect } from 'react';
import { enableStaticRendering, observer } from 'mobx-react-lite';
import { QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@penumbra-zone/ui/Toast';
import { TooltipProvider } from '@penumbra-zone/ui/Tooltip';
import { Header, SyncBar } from '@/widgets/header';
import { queryClient } from '@/shared/const/queryClient';
import { connectionStore } from '@/shared/model/connection';
import { recentPairsStore } from '@/pages/trade/ui/pair-selector/store';
import { starStore } from '@/features/star-pair';

// Used so that observer() won't subscribe to any observables used in an SSR environment
// and no garbage collection problems are introduced.
enableStaticRendering(typeof window === 'undefined');

export const App = observer(({ children }: { children: ReactNode }) => {
  useEffect(() => {
    connectionStore.setup();
    recentPairsStore.setup();
    starStore.setup();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={0}>
        <main className='relative z-0'>
          <SyncBar />
          <Header />
          {children}
        </main>
        <ToastProvider />
      </TooltipProvider>
    </QueryClientProvider>
  );
});
