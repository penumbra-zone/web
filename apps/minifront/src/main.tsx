import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { rootRouter } from './components/root-router';

import { wallets as keplrWallets } from '@cosmos-kit/keplr-extension';
//import { wallets as cosmostationWallets } from '@cosmos-kit/cosmostation';
//import { wallets as leapwallets } from '@cosmos-kit/leap';

import { cosmosTestnets, cosmosTestnetAssets } from '@penumbra-zone/constants/src/cosmos';
import { ChainProvider } from '@cosmos-kit/react';

const noMobileWallets = keplrWallets;

const Main = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ChainProvider
        chains={cosmosTestnets}
        assetLists={cosmosTestnetAssets}
        wallets={noMobileWallets}
      >
        <RouterProvider router={rootRouter} />
      </ChainProvider>
    </QueryClientProvider>
  );
};

const rootElement = document.getElementById('root') as HTMLDivElement;
createRoot(rootElement).render(<Main />);
