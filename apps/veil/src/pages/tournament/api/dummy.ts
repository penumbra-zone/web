import { Metadata, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { PositionId } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { base64ToUint8Array } from '@penumbra-zone/types/base64';

// TODO: remove this file after applying actual data to the APIs

export const DUMMY_POSITION_ID = new PositionId({
  inner: new Uint8Array([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 10,
  ]),
});

export const DUMMY_UM_METADATA = new Metadata({
  denomUnits: [
    {
      denom: 'penumbra',
      exponent: 6,
    },
    {
      denom: 'mpenumbra',
      exponent: 3,
    },
    {
      denom: 'upenumbra',
    },
  ],
  base: 'upenumbra',
  name: 'Penumbra',
  display: 'penumbra',
  symbol: 'UM',
  penumbraAssetId: {
    inner: base64ToUint8Array('KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA='),
  },
  images: [
    {
      svg: 'https://raw.githubusercontent.com/prax-wallet/registry/main/images/um.svg',
    },
  ],
  badges: [],
});

export const DUMMY_USDC_METADATA = new Metadata({
  description: 'USD Coin',
  denomUnits: [
    {
      denom: 'transfer/channel-2/uusdc',
    },
    {
      denom: 'transfer/channel-2/usdc',
      exponent: 6,
    },
  ],
  base: 'transfer/channel-2/uusdc',
  display: 'transfer/channel-2/usdc',
  name: 'USDC',
  symbol: 'USDC',
  penumbraAssetId: {
    inner: base64ToUint8Array('drPksQaBNYwSOzgfkGOEdrd4kEDkeALeh58Ps+7cjQs='),
  },
  images: [
    {
      png: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.png',
      svg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg',
      theme: {
        primaryColorHex: '#2775CA',
        circle: true,
      },
    },
  ],
  badges: [],
  priorityScore: 800000000100n,
  coingeckoId: 'usd-coin',
});

export const DUMMY_VALUE_VIEW = new ValueView({
  valueView: {
    case: 'knownAssetId',
    value: {
      metadata: DUMMY_UM_METADATA,
      amount: new Amount({
        lo: 9_000_000_000n,
        hi: 0n,
      }),
    },
  },
});
