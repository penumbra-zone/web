import { Chain as CosmosChain } from '@chain-registry/types';
import { testnetIbcChains } from '@penumbra-zone/constants/src/chains';
import { AllSlices, SliceCreator } from '.';
import type { ChainContext } from '@cosmos-kit/core';

export interface CosmosKitSlice {
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
    setChainContext: (ctx?: ChainContext) => {
      if (!ctx) {
        set(state => {
          state.cosmosKit = createCosmosKitSlice()(set, get, store);
        });
      } else {
        const { chain, address } = ctx;
        set(state => {
          state.cosmosKit.address = address;
          state.cosmosKit.chain = chain;
          state.cosmosKit.chainId = chain.chain_id;
          state.cosmosKit.chainName = chain.chain_name;
        });
      }
    },
  };
};

export const cosmosKitSelector = (state: AllSlices) => state.cosmosKit;
