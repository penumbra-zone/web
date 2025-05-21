import { ConnectError } from '@connectrpc/connect';
import { TransactionPlan } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { TransactionPlannerRequest } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { IndexedDbInterface } from '@penumbra-zone/types/indexed-db';
import { addLoHi } from '@penumbra-zone/types/lo-hi';

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

  // Constraint: validate that each spend and output action's asset ID matches the fee asset ID
  // in the fully-formed transaction plan.
  let feeAssetId = plan.transactionParameters?.fee?.assetId;
  feeAssetId ??= indexedDb.stakingTokenAssetId;

  let totalSpendAmount = { lo: 0n, hi: 0n };

  plan.actions.forEach(action => {
    if (action.action.case === 'spend') {
      // prettier-ignore
      if (!(action.action.value.note?.value?.assetId?.equals(feeAssetId))) {
        throw new ConnectError('Invalid transaction: Spend transaction was constructed improperly.');
      }

      // Accumulate the spend amounts
      const note = action.action.value.note;
      const noteAmount = note.value?.amount;
      if (!noteAmount) {
        throw new ConnectError('Invalid transaction: Missing note amount in spend action.');
      }
      totalSpendAmount = addLoHi(totalSpendAmount, {
        lo: BigInt(noteAmount.lo),
        hi: BigInt(noteAmount.hi),
      });
    }
  });
  plan.actions.forEach(action => {
    if (action.action.case === 'output') {
      // prettier-ignore
      if (!(action.action.value.value?.assetId?.equals(feeAssetId))) {
        throw new ConnectError('Invalid transaction: Spend transaction was constructed improperly.');
      }
    }
  });

  // Constraint: validate the requested spend amount is equal to the accumulated note balance.
  const spendValue = req.spends[0]?.value;
  if (!spendValue || !spendValue.amount) {
    throw new ConnectError('Invalid transaction: Missing value or amount in spend request.');
  }

  const { lo: spendLo, hi: spendHi } = spendValue.amount;

  const totalNoteBalance = await indexedDb.totalNoteBalance(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- already asserted source existence
    req.source!.account,
    feeAssetId,
  );

  if (totalNoteBalance.lo !== spendLo || totalNoteBalance.hi !== spendHi) {
    throw new ConnectError('Invalid transaction: Spend transaction was constructed improperly.');
  }

  // Constraint: validate the spend amount in the fully-formed transaction plan is equal to the accumulated note balance.
  if (totalNoteBalance.lo !== totalSpendAmount.lo || totalNoteBalance.hi !== totalSpendAmount.hi) {
    throw new ConnectError('Invalid transaction: Spend transaction was constructed improperly.');
  }

  // Constraint: validate a single output action in the fully-formed transaction plan.
  const outputActions = plan.actions.filter(action => action.action.case === 'output');
  if (outputActions.length > 1) {
    throw new ConnectError('Invalid transaction: Spend transaction was constructed improperly.');
  }
};
