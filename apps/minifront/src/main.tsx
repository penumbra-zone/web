import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { rootRouter } from './components/root-router';

import { ChainProvider } from '@cosmos-kit/react';
import { chains, assets } from 'chain-registry';
import { wallets } from '@cosmos-kit/keplr';

const osmoTest5Chain = chains.find(({ chain_id }) => chain_id === 'osmo-test-5')!;
const osmoTest5Assets = assets.find(({ chain_name }) => chain_name === osmoTest5Chain.chain_name)!;
const nobleTestChain = chains.find(({ chain_id }) => chain_id === 'grand-1')!;
const nobleTestAssets = assets.find(({ chain_name }) => chain_name === nobleTestChain.chain_name)!;

const Main = () => {
  const [queryClient] = useState(() => new QueryClient());

  console.log('chain osmosis', { osmoTest5Chain, osmoTest5Assets });

  return (
    <ChainProvider
      chains={[osmoTest5Chain, nobleTestChain]}
      assetLists={[osmoTest5Assets, nobleTestAssets]}
      wallets={wallets}
    >
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={rootRouter} />
      </QueryClientProvider>
    </ChainProvider>
  );
};

const rootElement = document.getElementById('root') as HTMLDivElement;
createRoot(rootElement).render(<Main />);
