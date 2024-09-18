import { Metadata, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
/**
 * A default `ValueView` to render when we don't have any balance data for a
 * particular token.
 */
export const zeroValueView = (metadata?: Metadata) =>
  new ValueView({
    valueView: {
      case: 'knownAssetId',
      value: {
        amount: { hi: 0n, lo: 0n },
        metadata: metadata,
      },
    },
  });
