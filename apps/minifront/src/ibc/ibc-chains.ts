import { chains } from 'chain-registry';
import { Chain as CosmosChain } from '@chain-registry/types';

import { testnetIbcChains } from '@penumbra-zone/constants/src/chains';
const supportedChainIds = testnetIbcChains.map(({ chainId }) => chainId);

export const cosmosTestnets: CosmosChain[] = chains.filter(({ chain_id }) =>
  Array.from(supportedChainIds).includes(chain_id),
);
