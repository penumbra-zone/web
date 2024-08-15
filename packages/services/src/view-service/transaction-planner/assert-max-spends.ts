import { TransactionPlan } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { Spend } from '@penumbra-zone/protobuf/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import { ConnectError } from '@connectrpc/connect';

export const assertSpendMax = (plan: TransactionPlan) => {
  const spends = plan.actions.filter(action => action) as Spend[];

  // If there is no spend action, there's nothing to validate.
  if (spends.length === 0) {
    return;
  }

  // Invariant: Validate that each spend action's asset ID matches the fee asset ID.
  const feeAssetId = plan.transactionParameters?.fee?.assetId;
  plan.actions.forEach(action => {
    if (action.action.case == 'spend') {
      if (action.action.value?.note?.value !== feeAssetId) {
        throw new ConnectError('Spend asset ID does not match the fee asset ID.');
      }
    }
  });
};
