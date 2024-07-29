import { Metadata, ValueView } from '@penumbra-zone/protobuf/types';
import { bech32mIdentityKey } from '@penumbra-zone/bech32m/penumbravalid';

const u8 = (length: number) => Uint8Array.from({ length }, () => Math.floor(Math.random() * 256));
const validatorIk = { ik: u8(32) };
const validatorIkString = bech32mIdentityKey(validatorIk);
const delString = 'delegation_' + validatorIkString;
const udelString = 'udelegation_' + validatorIkString;
const delAsset = { inner: u8(32) };
const unbondString = 'unbonding_start_at_123_' + validatorIkString;
const uunbondString = 'uunbonding_start_at_123_' + validatorIkString;
const unbondAsset = { inner: u8(32) };

const DELEGATION_TOKEN_METADATA = new Metadata({
  display: delString,
  base: udelString,
  denomUnits: [{ denom: udelString }, { denom: delString, exponent: 6 }],
  name: 'Delegation token',
  penumbraAssetId: delAsset,
  symbol: `delUM(${validatorIkString})`,
});

const UNBONDING_TOKEN_METADATA = new Metadata({
  display: unbondString,
  base: uunbondString,
  denomUnits: [{ denom: uunbondString }, { denom: unbondString, exponent: 6 }],
  name: 'Unbonding token',
  penumbraAssetId: unbondAsset,
  symbol: `unbondUMat123(${validatorIkString})`,
});

const PENUMBRA_METADATA = new Metadata({
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
  symbol: 'UM',
  penumbraAssetId: {
    altBaseDenom: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
  },
  images: [
    {
      svg: 'https://raw.githubusercontent.com/prax-wallet/registry/main/images/um.svg',
    },
  ],
});

export const PENUMBRA_VALUE_VIEW = new ValueView({
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: { hi: 0n, lo: 123_000_000n },
      metadata: PENUMBRA_METADATA,
    },
  },
});

export const DELEGATION_VALUE_VIEW = new ValueView({
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: { hi: 0n, lo: 123_000_000n },
      metadata: DELEGATION_TOKEN_METADATA,
    },
  },
});

export const UNBONDING_VALUE_VIEW = new ValueView({
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: { hi: 0n, lo: 123_000_000n },
      metadata: UNBONDING_TOKEN_METADATA,
    },
  },
});

export const UNKNOWN_ASSET_VALUE_VIEW = new ValueView({
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: { hi: 0n, lo: 123_000_000n },
      metadata: {
        penumbraAssetId: { inner: new Uint8Array([]) },
      },
    },
  },
});

export const UNKNOWN_ASSET_ID_VALUE_VIEW = new ValueView({
  valueView: {
    case: 'unknownAssetId',
    value: {
      amount: { hi: 0n, lo: 123_000_000n },
    },
  },
});
