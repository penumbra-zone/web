import { ConnectError } from '@connectrpc/connect';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { TransactionPlan } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { TransactionPlannerRequest } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

export const assertSpendMax = (
  req: TransactionPlannerRequest,
  plan: TransactionPlan,
  stakingToken: AssetId,
) => {
  if (req.spends.length === 0) {
    return;
  }

  // Constraint: validate that each spend action's asset ID matches the fee asset ID.
  let feeAssetId = plan.transactionParameters?.fee?.assetId;
  if (feeAssetId === undefined) {
    feeAssetId = stakingToken;
  }

  plan.actions.forEach(action => {
    if (action.action.case === 'spend') {
      // prettier-ignore
      if (!(action.action.value.note?.value?.assetId?.equals(feeAssetId))) {
        throw new ConnectError('Invalid transaction: The transaction was constructed improperly.');
      }
    }
  });
};
