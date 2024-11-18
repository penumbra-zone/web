'use client';

import { ReactNode } from 'react';
import { enableStaticRendering } from 'mobx-react-lite';
import { QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@penumbra-zone/ui/Toast';
import { Header, SyncBar } from '@/widgets/header';
import { queryClient } from '@/shared/const/queryClient';

// Used so that observer() won't subscribe to any observables used in an SSR environment
// and no garbage collection problems are introduced.
enableStaticRendering(typeof window === 'undefined');

export const App = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <SyncBar />
      <Header />
      {children}
      <ToastProvider />
    </QueryClientProvider>
  );
};
