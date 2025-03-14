import { getMetadata } from '@penumbra-zone/getters/value-view';
import { create, equals } from '@bufbuild/protobuf';
import { getFormattedAmtFromValueView } from '@penumbra-zone/types/value-view';
import {
  AssetIdSchema,
  Metadata,
  ValueView,
  ValueViewSchema,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Fee } from '@penumbra-zone/protobuf/penumbra/core/component/fee/v1/fee_pb';
import type { SwapActionProps } from './swap';

export const renderAmount = (value?: ValueView) => {
  if (!value) {
    return undefined;
  }
  const symbol = getMetadata.optional(value)?.symbol;
  return symbol ? `${getFormattedAmtFromValueView(value)} ${symbol}` : undefined;
};

/**
 * For Swap and SwapClaim actions, fees contain only the assetId and amount. This function
 * calculates a Metadata from this assetId. It firstly tries to get the info from the action itself,
 * and if it fails, it takes the Metadata from the registry (or ViewService, if passed).
 */
export const parseSwapFees = (
  fee?: Fee,
  asset1?: Metadata,
  asset2?: Metadata,
  getMetadataByAssetId?: SwapActionProps['getMetadataByAssetId'],
): string | undefined => {
  if (!fee) {
    return undefined;
  }

  let metadata: Metadata | undefined = undefined;
  if (
    fee.assetId &&
    asset1?.penumbraAssetId &&
    equals(AssetIdSchema, fee.assetId, asset1.penumbraAssetId)
  ) {
    metadata = asset1;
  }
  if (
    fee.assetId &&
    asset2?.penumbraAssetId &&
    equals(AssetIdSchema, fee.assetId, asset2.penumbraAssetId)
  ) {
    metadata = asset1;
  }

  if (!metadata && fee.assetId && getMetadataByAssetId) {
    metadata = getMetadataByAssetId(fee.assetId);
  }

  if (metadata) {
    return renderAmount(
      create(ValueViewSchema, {
        valueView: {
          case: 'knownAssetId',
          value: {
            metadata,
            amount: fee.amount,
          },
        },
      }),
    );
  }

  return renderAmount(
    create(ValueViewSchema, {
      valueView: {
        case: 'unknownAssetId',
        value: {
          assetId: fee.assetId,
          amount: fee.amount,
        },
      },
    }),
  );
};
