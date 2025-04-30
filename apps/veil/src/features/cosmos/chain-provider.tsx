import { ChainProvider } from '@cosmos-kit/react';
import { assets, chains } from 'chain-registry/mainnet';
import { SignerOptions, wallets } from 'cosmos-kit';
import { ReactNode, useMemo } from 'react';
import { Chain, Registry as PenumbraRegistry } from '@penumbra-labs/registry';

import { GeneratedType, Registry } from '@cosmjs/proto-signing';
import { AminoTypes } from '@cosmjs/stargate';
import {
  cosmosAminoConverters,
  cosmosProtoRegistry,
  cosmwasmAminoConverters,
  cosmwasmProtoRegistry,
  ibcAminoConverters,
  ibcProtoRegistry,
  osmosisAminoConverters,
  osmosisProtoRegistry,
} from 'osmo-query';

import '@interchain-ui/react/styles';

const protoRegistry: readonly [string, GeneratedType][] = [
  ...cosmosProtoRegistry,
  ...cosmwasmProtoRegistry,
  ...ibcProtoRegistry,
  ...osmosisProtoRegistry,
];

const aminoConverters = {
  ...cosmosAminoConverters,
  ...cosmwasmAminoConverters,
  ...ibcAminoConverters,
  ...osmosisAminoConverters,
};

const registry = new Registry(protoRegistry);
const aminoTypes = new AminoTypes(aminoConverters);

const signerOptions: SignerOptions = {
  signingStargate: () => {
    return {
      aminoTypes,
      registry,
    };
  },
};

interface IbcProviderProps {
  registry: PenumbraRegistry;
  children: ReactNode;
}

export const IbcChainProvider = ({ registry, children }: IbcProviderProps) => {
  const chainsToDisplay = useMemo(
    () => chainsInPenumbraRegistry(registry.ibcConnections),
    [registry],
  );

  return (
    <ChainProvider
      throwErrors={false}
      chains={chainsToDisplay}
      assetLists={assets}
      // Not using mobile wallets as WalletConnect is a centralized service that requires an account
      wallets={wallets.extension}
      signerOptions={signerOptions}
      modalTheme={{ defaultTheme: 'light' }}
      logLevel={'NONE'}
    >
      {children}
    </ChainProvider>
  );
};

// Searches cosmos registry for chains that have ibc connections to Penumbra
export const chainsInPenumbraRegistry = (ibcConnections: Chain[]) => {
  return chains.filter(c => ibcConnections.some(i => c.chain_id === i.chainId));
};
