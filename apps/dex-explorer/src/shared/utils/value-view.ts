import { Registry } from '@penumbra-labs/registry';
import {
  AssetId,
  Metadata,
  Value,
  ValueView,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { splitLoHi } from '@penumbra-zone/types/lo-hi';

type ToValueViewProps =
  | { amount: number; metadata: Metadata }
  | { amount: number; assetId: AssetId };

export const toValueView = (props: ToValueViewProps) => {
  const amount = splitLoHi(BigInt(props.amount));

  if ('metadata' in props) {
    return new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: {
          amount,
          metadata: props.metadata,
        },
      },
    });
  } else {
    return new ValueView({
      valueView: {
        case: 'unknownAssetId',
        value: {
          amount,
          assetId: props.assetId,
        },
      },
    });
  }
};

/**
 * Use a registry to convert a {@link Value} into a {@link ValueView}.
 */
export const registryView = (registry: Registry, value: Value): ValueView => {
  const metadata = value.assetId && registry.tryGetMetadata(value.assetId);
  if (!metadata) {
    return new ValueView({ valueView: { case: 'unknownAssetId', value } });
  }
  return new ValueView({
    valueView: { case: 'knownAssetId', value: { amount: value.amount, metadata } },
  });
};
