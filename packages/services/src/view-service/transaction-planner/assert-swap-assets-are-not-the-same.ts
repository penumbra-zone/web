import { TransactionPlannerRequest } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { Code, ConnectError } from '@connectrpc/connect';
import { getAssetIdFromValue } from '@penumbra-zone/getters/value';
import { equals } from '@bufbuild/protobuf';
import { AssetIdSchema } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

export const assertSwapAssetsAreNotTheSame = (
  transactionPlannerRequest: TransactionPlannerRequest,
) => {
  transactionPlannerRequest.swaps.forEach(swap => {
    const inputAssetId = getAssetIdFromValue(swap.value);
    const outputAssetId = swap.targetAsset;

    if (outputAssetId && equals(AssetIdSchema, inputAssetId, outputAssetId)) {
      throw new ConnectError(
        'Attempted to make a swap in which both assets were of the same type. A swap must be between two different asset types.',
        Code.InvalidArgument,
      );
    }
  });
};
