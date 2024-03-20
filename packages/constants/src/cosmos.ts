import registry, { chains, assets } from 'chain-registry';

// TODO: bad
export type CosmosChain = (typeof registry.chains)[number];
export type CosmosAssetList = (typeof registry.assets)[number];

const osmoTest5Chain = chains.find(({ chain_id }) => chain_id === 'osmo-test-5')!;
const osmoTest5Assets = assets.find(({ chain_name }) => chain_name === osmoTest5Chain.chain_name)!;
const nobleTestChain = chains.find(({ chain_id }) => chain_id === 'grand-1')!;
const nobleTestAssets = assets.find(({ chain_name }) => chain_name === nobleTestChain.chain_name)!;

export const cosmosTestnets: CosmosChain[] = [osmoTest5Chain, nobleTestChain];
export const cosmosTestnetAssets: CosmosAssetList[] = [osmoTest5Assets, nobleTestAssets];

export const getCosmosChainById = (id: string): CosmosChain | undefined =>
  cosmosTestnets.find(({ chain_id }) => chain_id === id);

export const getCosmosChainByName = (name: string): CosmosChain | undefined =>
  cosmosTestnets.find(({ chain_name }) => chain_name === name);
