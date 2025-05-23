import { Registry } from '@penumbra-labs/registry';
import {
  AssetId,
  Metadata,
  Value,
  ValueView,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { pnum } from '@penumbra-zone/types/pnum';

type ToValueViewProps =
  | { amount: number | Amount; metadata: Metadata }
  | { amount: number | Amount; assetId: AssetId }
  | { value: Value; getMetadata: (asset: AssetId | undefined) => Metadata | undefined };

export const toValueView = (props: ToValueViewProps) => {
  if ('metadata' in props) {
    return new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: {
          amount: pnum(props.amount).toAmount(),
          metadata: props.metadata,
        },
      },
    });
  } else if ('getMetadata' in props) {
    const metadata = props.getMetadata(props.value.assetId);
    if (metadata) {
      return new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: pnum(props.value.amount).toAmount(),
            metadata,
          },
        },
      });
    } else {
      return new ValueView({
        valueView: {
          case: 'unknownAssetId',
          value: {
            amount: pnum(props.value.amount).toAmount(),
            assetId: props.value.assetId,
          },
        },
      });
    }
  } else {
    return new ValueView({
      valueView: {
        case: 'unknownAssetId',
        value: {
          amount: pnum(props.amount).toAmount(),
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
