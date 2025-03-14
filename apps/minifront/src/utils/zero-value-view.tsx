import { Metadata, ValueViewSchema } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { create } from '@bufbuild/protobuf';
/**
 * A default `ValueView` to render when we don't have any balance data for a
 * particular token.
 */
export const zeroValueView = (metadata?: Metadata) =>
  create(ValueViewSchema, {
    valueView: {
      case: 'knownAssetId',
      value: {
        amount: { hi: 0n, lo: 0n },
        metadata: metadata,
      },
    },
  });
