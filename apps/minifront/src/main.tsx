import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { rootRouter } from './components/root-router';

import { wallets as keplrWallet } from '@cosmos-kit/keplr';
//import { wallets as cosmostationWallets } from '@cosmos-kit/cosmostation';
//import { wallets as leapwallets } from '@cosmos-kit/leap';

import { cosmosTestnets, cosmosTestnetAssets } from '@penumbra-zone/constants/src/cosmos';
import { ChainProvider } from '@cosmos-kit/react';

const Main = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ChainProvider
        chains={cosmosTestnets}
        assetLists={cosmosTestnetAssets}
        wallets={[...keplrWallet]}
      >
        <RouterProvider router={rootRouter} />
      </ChainProvider>
    </QueryClientProvider>
  );
};

const rootElement = document.getElementById('root') as HTMLDivElement;
createRoot(rootElement).render(<Main />);
