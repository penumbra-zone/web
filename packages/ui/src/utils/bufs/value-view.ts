import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { DELEGATION_TOKEN_METADATA, OSMO_METADATA, PENUMBRA_METADATA, UNBONDING_TOKEN_METADATA } from './metadata.ts';

export const PENUMBRA_VALUE_VIEW = new ValueView({
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: { hi: 0n, lo: 123_000_000n },
      metadata: PENUMBRA_METADATA,
    },
  },
});

export const OSMO_VALUE_VIEW = new ValueView({
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: { hi: 0n, lo: 987_000_000n },
      metadata: OSMO_METADATA,
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
