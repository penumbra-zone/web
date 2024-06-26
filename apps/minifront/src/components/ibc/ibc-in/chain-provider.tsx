import { ChainProvider } from '@cosmos-kit/react';
import { aminoTypes, registry as CosmosRegistry } from './config/defaults';
import { assets, chains } from 'chain-registry';
import { SignerOptions, wallets } from 'cosmos-kit';
import { ReactNode, useMemo } from 'react';
import { Registry as PenumbraRegistry } from '@penumbra-labs/registry';

import '@interchain-ui/react/styles';

const signerOptions: SignerOptions = {
  signingStargate: () => {
    return {
      aminoTypes,
      registry: CosmosRegistry,
    };
  },
};

interface IbcProviderProps {
  registry: PenumbraRegistry;
  children: ReactNode;
}

export const IbcChainProvider = ({ registry, children }: IbcProviderProps) => {
  const chainsToDisplay = useMemo(() => chainsInPenumbraRegistry(registry), [registry]);

  return (
    <ChainProvider
      chains={chainsToDisplay}
      assetLists={assets}
      // Not using mobile wallets as WalletConnect is a centralized service that requires an account
      wallets={wallets.extension}
      signerOptions={signerOptions}
      modalTheme={{ defaultTheme: 'light' }}
    >
      {children}
    </ChainProvider>
  );
};

// Searches cosmos registry for chains that have ibc connections to Penumbra
const chainsInPenumbraRegistry = ({ ibcConnections }: PenumbraRegistry) => {
  return chains.filter(c => ibcConnections.some(i => c.chain_id === i.chainId));
};
