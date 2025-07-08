'use client';

import { useEffect } from 'react';
import { enableStaticRendering, observer } from 'mobx-react-lite';
import { QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@penumbra-zone/ui/Toast';
import { TooltipProvider } from '@penumbra-zone/ui/Tooltip';
import { Header, SyncBar } from '@/widgets/header';
import { Footer } from '@/widgets/footer';
import { queryClient } from '@/shared/const/queryClient';
import { connectionStore } from '@/shared/model/connection';
import { recentPairsStore } from '@/pages/trade/ui/pair-selector/store';
import { starStore } from '@/features/star-pair';
import { JsonRegistryWithGlobals } from '@/shared/api/fetch-registry';
import { RegistryProvider } from '@/shared/api/registry';
import { ClientEnv } from '@/shared/api/env/types';
import { ClientEnvProvider } from '@/shared/api/env';

// Used so that observer() won't subscribe to any observables used in an SSR environment
// and no garbage collection problems are introduced.
enableStaticRendering(typeof window === 'undefined');

export interface AppProps {
  jsonRegistryWithGlobals: JsonRegistryWithGlobals;
  clientEnv: ClientEnv;
}

export const App = observer(
  ({ jsonRegistryWithGlobals, clientEnv, children }: React.PropsWithChildren<AppProps>) => {
    useEffect(() => {
      connectionStore.setup(clientEnv);
      recentPairsStore.setup();
      starStore.setup();
    }, [clientEnv]);

    return (
      <ClientEnvProvider value={clientEnv}>
        <RegistryProvider value={jsonRegistryWithGlobals}>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider delayDuration={0}>
              <div className='min-h-screen flex flex-col'>
                <main className='relative z-0 flex-1'>
                  <SyncBar />
                  <Header />
                  {children}
                </main>
                <Footer />
              </div>
              <div className='relative z-10'>
                <ToastProvider />
              </div>
            </TooltipProvider>
          </QueryClientProvider>
        </RegistryProvider>
      </ClientEnvProvider>
    );
  },
);
