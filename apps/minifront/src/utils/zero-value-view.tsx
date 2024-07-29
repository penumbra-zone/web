import { Metadata, ValueView } from '@penumbra-zone/protobuf/types';
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
