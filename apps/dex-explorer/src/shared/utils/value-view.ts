import {
  AssetId,
  Metadata,
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
