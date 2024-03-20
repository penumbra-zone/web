import { Chain as CosmosChain } from '@chain-registry/types';
import { testnetIbcChains } from '@penumbra-zone/constants/src/chains';
import { AllSlices, SliceCreator } from '.';
import { ChainContext } from '@cosmos-kit/core';

export interface CosmosKitSlice {
  connected: boolean;
  address?: string;
  chainName?: string;
  chainId?: string;
  chain?: CosmosChain;
  setChainContext: (context: ChainContext) => void;
}

export const createCosmosKitSlice = (): SliceCreator<CosmosKitSlice> => (set, get, store) => {
  const defaultChain = testnetIbcChains[0]!;
  return {
    chainName: defaultChain.chainName,
    connected: false,
    setChainContext: (ctx?: ChainContext) => {
      if (!ctx) {
        set(state => {
          state.cosmosKit = createCosmosKitSlice()(set, get, store);
        });
      } else {
        const { chain, isWalletConnected, address } = ctx;
        set(state => {
          state.cosmosKit.address = address;
          state.cosmosKit.chain = chain;
          state.cosmosKit.chainId = chain.chain_id;
          state.cosmosKit.chainName = chain.chain_name;
          state.cosmosKit.connected = isWalletConnected;
        });
      }
    },
  };
};

export const cosmosKitSelector = (state: AllSlices) => state.cosmosKit;
