import { TransactionPlan } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { ConnectError } from '@connectrpc/connect';

export const assertSpendMax = (plan: TransactionPlan) => {
  // Invariant: Validate that each spend action's asset ID matches the fee asset ID.
  const feeAssetId = plan.transactionParameters?.fee?.assetId;
  plan.actions.forEach(action => {
    if (action.action.case === 'spend') {
      if (action.action.value.note?.value !== feeAssetId) {
        throw new ConnectError('Spend asset ID does not match the fee asset ID.');
      }
    }
  });
};
