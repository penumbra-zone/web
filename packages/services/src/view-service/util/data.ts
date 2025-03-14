import { MetadataSchema } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { fromJson } from '@bufbuild/protobuf';

export const UM_METADATA = fromJson(MetadataSchema, {
  description: 'The native token of Penumbra',
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
  display: 'penumbra',
  name: 'Penumbra',
  symbol: 'UM',
  penumbraAssetId: {
    inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
  },
  images: [
    {
      svg: 'https://raw.githubusercontent.com/prax-wallet/registry/main/images/um.svg',
      theme: {
        primaryColorHex: '#c9a975',
      },
    },
  ],
  priorityScore: '999999999999',
  coingeckoId: 'penumbra',
});

export const USDC_METADATA = fromJson(MetadataSchema, {
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
    inner: 'drPksQaBNYwSOzgfkGOEdrd4kEDkeALeh58Ps+7cjQs=',
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
  priorityScore: '800000000100',
  coingeckoId: 'usd-coin',
});

export const SHITMOS_METADATA = fromJson(MetadataSchema, {
  description: "The Cosmos Network's premier self-hatred memecoin.",
  denomUnits: [
    {
      denom:
        'transfer/channel-4/factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/shitmos',
    },
    {
      denom: 'transfer/channel-4/SHITMOS',
      exponent: 6,
    },
  ],
  base: 'transfer/channel-4/factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/shitmos',
  display: 'transfer/channel-4/SHITMOS',
  name: 'Shitmos',
  symbol: 'SHITMOS',
  penumbraAssetId: {
    inner: 'p6M59C5nGy2x3iJtRIPT5jA2ZhytFVTXX192/gTsHgA=',
  },
  images: [
    {
      png: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/shitmos.png',
      svg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/shitmos.svg',
      theme: {
        primaryColorHex: '#639BFF',
        circle: true,
      },
    },
  ],
  priorityScore: '800000000096',
});
