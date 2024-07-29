import { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb.js';
import { TransactionClassification } from './classification.js';

export const classifyTransaction = (txv?: TransactionView): TransactionClassification => {
  // Check if 'txv' is undefined and return "Unknown" if it is.
  if (!txv) {
    return 'unknown';
  }

  const allActionCases = new Set(txv.bodyView?.actionViews.map(a => a.actionView.case));

  if (allActionCases.has('swap')) {
    return 'swap';
  }
  if (allActionCases.has('swapClaim')) {
    return 'swapClaim';
  }
  if (allActionCases.has('delegate')) {
    return 'delegate';
  }
  if (allActionCases.has('undelegate')) {
    return 'undelegate';
  }
  if (allActionCases.has('undelegateClaim')) {
    return 'undelegateClaim';
  }
  if (allActionCases.has('ics20Withdrawal')) {
    return 'ics20Withdrawal';
  }
  if (allActionCases.has('actionDutchAuctionSchedule')) {
    return 'dutchAuctionSchedule';
  }
  if (allActionCases.has('actionDutchAuctionEnd')) {
    return 'dutchAuctionEnd';
  }
  if (allActionCases.has('actionDutchAuctionWithdraw')) {
    return 'dutchAuctionWithdraw';
  }
  if (allActionCases.has('delegatorVote')) {
    return 'delegatorVote';
  }
  if (allActionCases.has('validatorVote')) {
    return 'validatorVote';
  }
  if (allActionCases.has('validatorDefinition')) {
    return 'validatorDefinition';
  }
  if (allActionCases.has('ibcRelayAction')) {
    return 'ibcRelayAction';
  }
  if (allActionCases.has('proposalSubmit')) {
    return 'proposalSubmit';
  }
  if (allActionCases.has('proposalWithdraw')) {
    return 'proposalWithdraw';
  }
  if (allActionCases.has('proposalDepositClaim')) {
    return 'proposalDepositClaim';
  }
  if (allActionCases.has('positionOpen')) {
    return 'positionOpen';
  }
  if (allActionCases.has('positionClose')) {
    return 'positionClose';
  }
  if (allActionCases.has('positionWithdraw')) {
    return 'positionWithdraw';
  }
  if (allActionCases.has('positionRewardClaim')) {
    return 'positionRewardClaim';
  }
  if (allActionCases.has('communityPoolSpend')) {
    return 'communityPoolSpend';
  }
  if (allActionCases.has('communityPoolDeposit')) {
    return 'communityPoolDeposit';
  }
  if (allActionCases.has('communityPoolOutput')) {
    return 'communityPoolOutput';
  }

  const hasOpaqueSpend = txv.bodyView?.actionViews.some(
    a => a.actionView.case === 'spend' && a.actionView.value.spendView.case === 'opaque',
  );
  const allSpendsVisible = !hasOpaqueSpend;

  const hasOpaqueOutput = txv.bodyView?.actionViews.some(
    a => a.actionView.case === 'output' && a.actionView.value.outputView.case === 'opaque',
  );
  const allOutputsVisible = !hasOpaqueOutput;

  // A visible output whose note is controlled by an opaque address is an output we don't control.
  const hasVisibleOutputWithOpaqueAddress = txv.bodyView?.actionViews.some(
    a =>
      a.actionView.case === 'output' &&
      a.actionView.value.outputView.case === 'visible' &&
      a.actionView.value.outputView.value.note?.address?.addressView.case === 'opaque',
  );

  // A visible output whose note is controlled by an opaque address is an output we do control.
  const hasVisibleOutputWithVisibleAddress = txv.bodyView?.actionViews.some(
    a =>
      a.actionView.case === 'output' &&
      a.actionView.value.outputView.case === 'visible' &&
      a.actionView.value.outputView.value.note?.address?.addressView.case === 'decoded',
  );

  // A transaction is internal if all spends and outputs are visible, and there are no outputs we don't control.
  const isInternal = allSpendsVisible && allOutputsVisible && !hasVisibleOutputWithOpaqueAddress;

  // Call a transaction a "transfer" if it only has spends and outputs.
  const isTransfer = txv.bodyView?.actionViews.every(
    a => a.actionView.case === 'spend' || a.actionView.case === 'output',
  );

  // If the tx has only spends and outputs, then it's a transfer. What kind?
  if (isTransfer) {
    // If we can't see at least one spend, but we can see an output we control, it's a receive.
    if (hasOpaqueSpend && hasVisibleOutputWithVisibleAddress) {
      return 'receive';
    }
    // If we can see all spends and outputs, it's a transaction we created...
    if (allSpendsVisible && allOutputsVisible) {
      // ... so it's either a send or an internal transfer, depending on whether there's an output we don't control.
      if (isInternal) {
        return 'internalTransfer';
      } else {
        return 'send';
      }
    }
  }

  if (isInternal) {
    return 'unknownInternal';
  }

  // Fallthrough
  return 'unknown';
};

export const TRANSACTION_LABEL_BY_CLASSIFICATION: Record<TransactionClassification, string> = {
  unknown: 'Unknown',
  unknownInternal: 'Unknown (Internal)',
  receive: 'Receive',
  send: 'Send',
  internalTransfer: 'Internal Transfer',
  swap: 'Swap',
  swapClaim: 'Swap Claim',
  delegate: 'Delegate',
  undelegate: 'Undelegate',
  undelegateClaim: 'Undelegate Claim',
  ics20Withdrawal: 'Ics20 Withdrawal',
  dutchAuctionSchedule: 'Dutch Auction Schedule',
  dutchAuctionEnd: 'Dutch Auction End',
  dutchAuctionWithdraw: 'Dutch Auction Withdraw',
  delegatorVote: 'Delegator Vote',
  validatorVote: 'Validator Vote',
  communityPoolDeposit: 'Community Pool Deposit',
  communityPoolOutput: 'Community Pool Output',
  communityPoolSpend: 'Community Pool Spend',
  ibcRelayAction: 'IBC Relay Action',
  positionClose: 'Position Close',
  positionOpen: 'Position Open',
  positionRewardClaim: 'Position Reward Claim',
  positionWithdraw: 'Position Withdraw',
  proposalDepositClaim: 'Proposal Deposit Claim',
  proposalSubmit: 'Proposal Submit',
  proposalWithdraw: 'Proposal Withdraw',
  validatorDefinition: 'Validator Definition',
};

export const getTransactionClassificationLabel = (txv?: TransactionView): string =>
  TRANSACTION_LABEL_BY_CLASSIFICATION[classifyTransaction(txv)];
