import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

/**
 * A default `ValueView` to render when we don't have any balance data for a
 * particular token.
 */
export const ZERO_BALANCE_UM = new ValueView({
  valueView: {
    case: 'knownAssetId',
    value: {
      amount: { hi: 0n, lo: 0n },
      metadata: STAKING_TOKEN_METADATA,
    },
  },
});
