import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

export interface Chain {
  displayName: string;
  chainId: string;
  ibcChannel: string;
  iconUrl: string;
  nativeAssets: AssetId[];
  addressPrefix: string;
}

// Canonical data source: https://github.com/cosmos/chain-registry/tree/master
export const testnetIbcChains: Chain[] = [
  {
    displayName: 'Osmosis',
    chainId: 'osmo-test-5',
    ibcChannel: 'channel-0',
    iconUrl:
      'https://raw.githubusercontent.com/cosmos/chain-registry/f1348793beb994c6cc0256ed7ebdb48c7aa70003/osmosis/images/osmo.svg',
    nativeAssets: [],
    addressPrefix: 'osmo',
  },
  {
    displayName: 'Noble',
    chainId: 'grand-1',
    ibcChannel: 'channel-2',
    iconUrl:
      'https://raw.githubusercontent.com/cosmos/chain-registry/2ca39d0e4eaf3431cca13991948e099801f02e46/noble/images/stake.svg',
    nativeAssets: [],
    addressPrefix: 'noble',
  },
];
