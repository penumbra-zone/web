import { ValueViewSchema } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { create } from '@bufbuild/protobuf';
import {
  DELEGATION_TOKEN_METADATA,
  OSMO_METADATA,
  PENUMBRA_METADATA,
  UNBONDING_TOKEN_METADATA,
  USDC_METADATA,
} from './metadata.ts';
import { AMOUNT_123_456_789, AMOUNT_999, AMOUNT_ZERO } from './amount';

export const PENUMBRA_VALUE_VIEW = create(ValueViewSchema, {
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: AMOUNT_123_456_789,
      metadata: PENUMBRA_METADATA,
    },
  },
});

export const PENUMBRA_VALUE_VIEW_ZERO = create(ValueViewSchema, {
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: AMOUNT_ZERO,
      metadata: PENUMBRA_METADATA,
    },
  },
});

export const USDC_VALUE_VIEW = create(ValueViewSchema, {
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: AMOUNT_999,
      metadata: USDC_METADATA,
    },
  },
});

export const OSMO_VALUE_VIEW = create(ValueViewSchema, {
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: AMOUNT_999,
      metadata: OSMO_METADATA,
    },
  },
});

export const DELEGATION_VALUE_VIEW = create(ValueViewSchema, {
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: AMOUNT_123_456_789,
      metadata: DELEGATION_TOKEN_METADATA,
    },
  },
});

export const UNBONDING_VALUE_VIEW = create(ValueViewSchema, {
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: AMOUNT_123_456_789,
      metadata: UNBONDING_TOKEN_METADATA,
    },
  },
});

export const UNKNOWN_ASSET_VALUE_VIEW = create(ValueViewSchema, {
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: AMOUNT_999,
      metadata: {
        penumbraAssetId: { inner: new Uint8Array([]) },
      },
    },
  },
});

export const UNKNOWN_ASSET_ID_VALUE_VIEW = create(ValueViewSchema, {
  valueView: {
    case: 'unknownAssetId',
    value: {
      amount: AMOUNT_123_456_789,
    },
  },
});
