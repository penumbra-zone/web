import { bech32mIdentityKey } from '@penumbra-zone/bech32m/penumbravalid';
import { AssetId, Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { base64ToUint8Array } from '@penumbra-zone/types/base64';

const u8 = (length: number) => Uint8Array.from({ length }, () => Math.floor(Math.random() * 256));
const validatorIk = { ik: u8(32) };
const validatorIkString = bech32mIdentityKey(validatorIk);
const delString = 'delegation_' + validatorIkString;
const udelString = 'udelegation_' + validatorIkString;
const delAsset = { inner: u8(32) };
const unbondString = 'unbonding_start_at_123_' + validatorIkString;
const uunbondString = 'uunbonding_start_at_123_' + validatorIkString;
const unbondAsset = { inner: u8(32) };

export const DELEGATION_TOKEN_METADATA = new Metadata({
  display: delString,
  base: udelString,
  denomUnits: [{ denom: udelString }, { denom: delString, exponent: 6 }],
  name: 'Delegation token',
  penumbraAssetId: delAsset,
  symbol: `delUM(${validatorIkString})`,
});

export const UNBONDING_TOKEN_METADATA = new Metadata({
  display: unbondString,
  base: uunbondString,
  denomUnits: [{ denom: uunbondString }, { denom: unbondString, exponent: 6 }],
  name: 'Unbonding token',
  penumbraAssetId: unbondAsset,
  symbol: `unbondUMat123(${validatorIkString})`,
});

export const PENUMBRA_METADATA = new Metadata({
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
  penumbraAssetId: new AssetId({ inner: u8(32) }),
  images: [
    {
      svg: 'https://raw.githubusercontent.com/prax-wallet/registry/main/images/um.svg',
    },
  ],
  badges: [
    {
      svg: 'https://raw.githubusercontent.com/prax-wallet/registry/refs/heads/main/images/full-moon-face.svg',
    },
  ],
});

export const USDC_METADATA = new Metadata({
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
  badges: [
    {
      svg: 'https://raw.githubusercontent.com/prax-wallet/registry/refs/heads/main/images/pizza.svg',
    },
  ],
  priorityScore: 800000000100n,
  coingeckoId: 'usd-coin',
});

export const OSMO_METADATA = new Metadata({
  description: 'The native token of Osmosis',
  denomUnits: [
    {
      denom: 'transfer/channel-4/uosmo',
    },
    {
      denom: 'transfer/channel-4/osmo',
      exponent: 6,
    },
  ],
  base: 'transfer/channel-4/uosmo',
  display: 'transfer/channel-4/osmo',
  name: 'Osmosis',
  symbol: 'OSMO',
  penumbraAssetId: {
    inner: base64ToUint8Array('KSOgqHs6JCHxZcyFPb9zqb2vtdoNlIVktgWcsCF8RAc='),
  },
  images: [
    {
      png: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png',
      svg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.svg',
      theme: {
        primaryColorHex: '#760dbb',
      },
    },
  ],
  priorityScore: 800000000099n,
});

export const PIZZA_METADATA = new Metadata({
  symbol: 'PIZZA',
  name: 'Pizza',
  penumbraAssetId: new AssetId({ inner: u8(32) }),
  base: 'upizza',
  display: 'pizza',
  denomUnits: [{ denom: 'upizza' }, { denom: 'pizza', exponent: 6 }],
});

export const UNKNOWN_TOKEN_METADATA = new Metadata({
  penumbraAssetId: { inner: new Uint8Array([]) },
});

export const LPNFT_METADATA = Metadata.fromJson({
  name: '',
  description: '',
  base: 'lpnft_opened_plpid1m6ur4fdafnmv2fp65rvwxhx6gztm4pghczesxs4xy89se85gqn3qv4sdjp',
  display: 'lpnft_opened_plpid1m6ur4fdafnmv2fp65rvwxhx6gztm4pghczesxs4xy89se85gqn3qv4sdjp',
  symbol: 'lpNft:opened(m6ur4fdafnmv2fp65rvwxhx6gztm4pghczesxs4xy89se85gqn3qv4sdjp)',
  images: [],
  priorityScore: '30',
  denomUnits: [
    {
      denom: 'lpnft_opened_plpid1m6ur4fdafnmv2fp65rvwxhx6gztm4pghczesxs4xy89se85gqn3qv4sdjp',
      exponent: 0,
      aliases: [],
    },
  ],
  penumbraAssetId: {
    inner: 'rtchIR1VaNZpAxSMh7+Wf2VU8Kfs9b5qDE+kMTGsRww=',
  },
});
