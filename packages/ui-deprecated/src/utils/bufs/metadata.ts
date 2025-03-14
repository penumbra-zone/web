import { bech32mIdentityKey } from '@penumbra-zone/bech32m/penumbravalid';
import { create } from '@bufbuild/protobuf';
import {
  AssetIdSchema,
  MetadataSchema,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

const u8 = (length: number) => Uint8Array.from({ length }, () => Math.floor(Math.random() * 256));
const validatorIk = { ik: u8(32) };
const validatorIkString = bech32mIdentityKey(validatorIk);
const delString = 'delegation_' + validatorIkString;
const udelString = 'udelegation_' + validatorIkString;
const delAsset = { inner: u8(32) };
const unbondString = 'unbonding_start_at_123_' + validatorIkString;
const uunbondString = 'uunbonding_start_at_123_' + validatorIkString;
const unbondAsset = { inner: u8(32) };

export const DELEGATION_TOKEN_METADATA = create(MetadataSchema, {
  display: delString,
  base: udelString,
  denomUnits: [{ denom: udelString }, { denom: delString, exponent: 6 }],
  name: 'Delegation token',
  penumbraAssetId: delAsset,
  symbol: `delUM(${validatorIkString})`,
});

export const UNBONDING_TOKEN_METADATA = create(MetadataSchema, {
  display: unbondString,
  base: uunbondString,
  denomUnits: [{ denom: uunbondString }, { denom: unbondString, exponent: 6 }],
  name: 'Unbonding token',
  penumbraAssetId: unbondAsset,
  symbol: `unbondUMat123(${validatorIkString})`,
});

export const PENUMBRA_METADATA = create(MetadataSchema, {
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
  penumbraAssetId: create(AssetIdSchema, { inner: u8(32) }),
  images: [
    {
      svg: 'https://raw.githubusercontent.com/prax-wallet/registry/main/images/um.svg',
    },
  ],
});

export const OSMO_METADATA = create(MetadataSchema, {
  symbol: 'OSMO',
  name: 'Osmosis',
  penumbraAssetId: create(AssetIdSchema, { inner: u8(32) }),
  base: 'uosmo',
  display: 'osmo',
  denomUnits: [{ denom: 'uosmo' }, { denom: 'osmo', exponent: 6 }],
});

export const PIZZA_METADATA = create(MetadataSchema, {
  symbol: 'PIZZA',
  name: 'Pizza',
  penumbraAssetId: create(AssetIdSchema, { inner: u8(32) }),
  base: 'upizza',
  display: 'pizza',
  denomUnits: [{ denom: 'upizza' }, { denom: 'pizza', exponent: 6 }],
});

export const UNKNOWN_TOKEN_METADATA = create(MetadataSchema, {
  penumbraAssetId: { inner: new Uint8Array([]) },
});
