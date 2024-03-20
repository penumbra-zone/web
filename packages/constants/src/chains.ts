export interface Chain {
  displayName: string;
  chainId: string;
  chainName: string;
  ibcChannel: string;
  iconUrl: string;
  addressPrefix: string;
}

export const getChainMetadataById = (id: string) =>
  testnetIbcChains.find(({ chainId }) => chainId === id);

export const getChainMetadataByName = (name: string) =>
  testnetIbcChains.find(({ chainName }) => chainName === name);

// Canonical data source: https://github.com/cosmos/chain-registry/tree/master
export const testnetIbcChains: Chain[] = [
  {
    displayName: 'Osmosis',
    chainId: 'osmo-test-5',
    chainName: 'osmosistestnet',
    ibcChannel: 'channel-0',
    iconUrl:
      'https://raw.githubusercontent.com/cosmos/chain-registry/f1348793beb994c6cc0256ed7ebdb48c7aa70003/osmosis/images/osmo.svg',
    addressPrefix: 'osmo',
  },
  {
    displayName: 'Noble',
    chainId: 'grand-1',
    ibcChannel: 'channel-3',
    chainName: 'nobletestnet',
    iconUrl:
      'https://raw.githubusercontent.com/cosmos/chain-registry/2ca39d0e4eaf3431cca13991948e099801f02e46/noble/images/stake.svg',
    addressPrefix: 'noble',
  },
];
