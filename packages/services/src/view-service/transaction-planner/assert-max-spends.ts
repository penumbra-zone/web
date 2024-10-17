import { ConnectError } from '@connectrpc/connect';
import { TransactionPlan } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { TransactionPlannerRequest } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { IndexedDbInterface } from '@penumbra-zone/types/indexed-db';

export const assertSpendMax = async (
  req: TransactionPlannerRequest,
  plan: TransactionPlan,
  indexedDb: IndexedDbInterface,
) => {
  // If it's not a spend transaction request, skip the assertion checks.
  if (req.spends.length === 0) {
    return;
  }

  // Constraint: validate the Spend transaction planner request is constructed in isolation.
  if (
    req.outputs.length > 0 ||
    req.swaps.length > 0 ||
    req.swapClaims.length > 0 ||
    req.delegations.length > 0 ||
    req.undelegations.length > 0 ||
    req.undelegationClaims.length > 0 ||
    req.ibcRelayActions.length > 0 ||
    req.ics20Withdrawals.length > 0 ||
    req.positionOpens.length > 0 ||
    req.positionCloses.length > 0 ||
    req.positionWithdraws.length > 0 ||
    req.dutchAuctionScheduleActions.length > 0 ||
    req.dutchAuctionEndActions.length > 0 ||
    req.dutchAuctionWithdrawActions.length > 0 ||
    req.delegatorVotes.length > 0 ||
    req.ibcRelayActions.length > 0
  ) {
    throw new ConnectError('Invalid transaction: Spend transaction was constructed improperly.');
  }

  // Constraint: validate that the transaction planner request is constructed with a single spend request.
  if (req.spends.length > 1) {
    throw new ConnectError('Invalid transaction: Spend transaction was constructed improperly.');
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
        throw new ConnectError('Invalid transaction: Spend transaction was constructed improperly.');
      }
    }
  });

  // Constraint: validate the requested spend amount is equal to the accumulated note balance.
  const totalNoteBalance = await indexedDb.totalNoteBalance(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- already asserted source existence
    req.source!.account,
    feeAssetId,
  );
  if (
    totalNoteBalance.lo !== req.spends[0]?.value?.amount?.lo ||
    totalNoteBalance.hi !== req.spends[0]?.value?.amount?.hi
  ) {
    throw new ConnectError('Invalid transaction: Spend transaction was constructed improperly.');
  }

  // Constraint: validate a single output action in the fully-formed transaction.
  const outputActions = plan.actions.filter(action => action.action.case === 'output');
  if (outputActions.length > 1) {
    throw new ConnectError('Invalid transaction: Spend transaction was constructed improperly.');
  }
};
