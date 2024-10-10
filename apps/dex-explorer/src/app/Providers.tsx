'use client';

import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/shared/queryClient';
import { StyledComponentsRegistry } from './StyleRegistry';

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <StyledComponentsRegistry>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </StyledComponentsRegistry>
  );
};
