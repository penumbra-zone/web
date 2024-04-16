import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Code, ConnectError } from '@connectrpc/connect';
import { getAssetIdFromValue } from '@penumbra-zone/getters/src/value';

export const assertSwapAssetsAreNotTheSame = (
  transactionPlannerRequest: TransactionPlannerRequest,
) => {
  transactionPlannerRequest.swaps.forEach(swap => {
    const inputAssetId = getAssetIdFromValue(swap.value);
    const outputAssetId = swap.targetAsset;

    if (inputAssetId.equals(outputAssetId)) {
      throw new ConnectError(
        'Attempted to make a swap in which both assets were of the same type. A swap must be between two different asset types.',
        Code.InvalidArgument,
      );
    }
  });
};
