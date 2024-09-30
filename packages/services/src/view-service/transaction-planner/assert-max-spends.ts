import { ConnectError } from '@connectrpc/connect';
import { TransactionPlan } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { TransactionPlannerRequest } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { IndexedDbInterface } from '@penumbra-zone/types/indexed-db';

export const assertSpendMax = async (
  req: TransactionPlannerRequest,
  plan: TransactionPlan,
  indexedDb: IndexedDbInterface,
) => {
  if (req.spends.length === 0) {
    return;
  }

  // Constraint: validate that the transaction planner request is constructed with a single spend request.
  if (req.spends.length > 1) {
    throw new ConnectError('Invalid transaction: The transaction was constructed improperly!');
  }

  // Constraint: validate that each spend action's asset ID matches the fee asset ID.
  let feeAssetId = plan.transactionParameters?.fee?.assetId;
  if (feeAssetId === undefined) {
    feeAssetId = indexedDb.stakingTokenAssetId;
  }

  plan.actions.forEach(action => {
    if (action.action.case === 'spend') {
      // prettier-ignore
      if (!(action.action.value.note?.value?.assetId?.equals(feeAssetId))) {
        throw new ConnectError('Invalid transaction: The transaction was constructed improperly.');
      }
    }
  });

  // Constraint: validate the requested spend amount is equal to the accumulated note balance.
  const accumulatedBalance = await indexedDb.accumulateNoteBalance(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- already asserted source existence
    req.source!.account,
    feeAssetId,
  );
  if (
    accumulatedBalance.lo !== req.spends[0]?.value?.amount?.lo ||
    accumulatedBalance.hi !== req.spends[0]?.value?.amount?.hi
  ) {
    throw new ConnectError('Invalid transaction: The transaction was constructed improperly.');
  }
};
