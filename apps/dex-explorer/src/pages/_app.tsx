// @ts-nocheck
/* eslint-disable -- disabling this file as this was created before our strict rules */
import type { AppProps } from 'next/app';
import React from 'react';
import '@/global.css';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Analytics } from '@vercel/analytics/react';
import { inject } from '@vercel/analytics';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { injectSpeedInsights } from '@vercel/speed-insights';

const queryClient = new QueryClient();

function app({ Component, pageProps }: AppProps) {
  // Inject the analytics script
  inject();
  // Inject the speed insights script
  injectSpeedInsights();

  // May not necessarily be the best way to apply global styles
  const theme = extendTheme({
    styles: {
      global: {
        // Apply some styles globally across all elements
        body: {
          bg: 'var(--charcoal-secondary)',
          color: 'var(--light-grey)',
          fontFamily: 'sans-serif',
          fontWeight: '400',
        },
      },
    },
  });

  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <Analytics />
        <SpeedInsights />
        <Component {...pageProps} />
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default app;
