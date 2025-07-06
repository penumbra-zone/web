import {
  TransactionView,
  ActionView,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { MsgRecvPacket } from '@penumbra-zone/protobuf/ibc/core/channel/v1/tx_pb';

export type TransactionClassification =
  /** We don't know what kind of transaction this is, or it's undefined. */
  | 'unknown'
  /** We know that it's internal (e.g, a swap), but nothing more. */
  | 'unknownInternal'
  /** The transaction is an internal transfer between the user's accounts. */
  | 'internalTransfer'
  /** The transaction is a send to an external account. */
  | 'send'
  /** The transaction is a receive from an external account. */
  | 'receive'
  /** The transactions below are one that contain the respective action. */
  | 'swap'
  | 'swapClaim'
  | 'delegate'
  | 'undelegate'
  | 'undelegateClaim'
  | 'ics20Withdrawal'
  | 'dutchAuctionSchedule'
  | 'dutchAuctionEnd'
  | 'dutchAuctionWithdraw'
  | 'delegatorVote'
  | 'validatorVote'
  | 'validatorDefinition'
  | 'ibcRelayAction'
  | 'proposalSubmit'
  | 'proposalWithdraw'
  | 'proposalDepositClaim'
  | 'positionOpen'
  | 'positionClose'
  | 'positionWithdraw'
  | 'positionRewardClaim'
  | 'communityPoolSpend'
  | 'communityPoolOutput'
  | 'communityPoolDeposit'
  | 'liquidityTournamentVote';

export interface ClassificationReturn {
  /** A type of the main action that defines a transaction */
  type: TransactionClassification;
  /** A main action that defines the transaction */
  action?: ActionView;
}

/**
 * Takes a transaction view, finds the most relevant action that defines its type, and returns it.
 */
export const classifyTransaction = (txv?: TransactionView): ClassificationReturn => {
  // Check if 'txv' is undefined and return "Unknown" if it is.
  if (!txv) {
    return {
      type: 'unknown',
    };
  }

  const allActionCases = new Map(txv.bodyView?.actionViews.map(a => [a.actionView.case, a]));

  if (allActionCases.has('swap')) {
    const action = allActionCases.get('swap');
    return {
      type: 'swap',
      action,
    };
  }
  if (allActionCases.has('swapClaim')) {
    return {
      type: 'swapClaim',
      action: allActionCases.get('swapClaim'),
    };
  }
  if (allActionCases.has('delegate')) {
    return {
      type: 'delegate',
      action: allActionCases.get('delegate'),
    };
  }
  if (allActionCases.has('undelegate')) {
    return {
      type: 'undelegate',
      action: allActionCases.get('undelegate'),
    };
  }
  if (allActionCases.has('undelegateClaim')) {
    return {
      type: 'undelegateClaim',
      action: allActionCases.get('undelegateClaim'),
    };
  }
  if (allActionCases.has('ics20Withdrawal')) {
    return {
      type: 'ics20Withdrawal',
      action: allActionCases.get('ics20Withdrawal'),
    };
  }
  if (allActionCases.has('actionDutchAuctionSchedule')) {
    return {
      type: 'dutchAuctionSchedule',
      action: allActionCases.get('actionDutchAuctionSchedule'),
    };
  }
  if (allActionCases.has('actionDutchAuctionEnd')) {
    return {
      type: 'dutchAuctionEnd',
      action: allActionCases.get('actionDutchAuctionEnd'),
    };
  }
  if (allActionCases.has('actionDutchAuctionWithdraw')) {
    return {
      type: 'dutchAuctionWithdraw',
      action: allActionCases.get('actionDutchAuctionWithdraw'),
    };
  }
  if (allActionCases.has('delegatorVote')) {
    return {
      type: 'delegatorVote',
      action: allActionCases.get('delegatorVote'),
    };
  }
  if (allActionCases.has('validatorVote')) {
    return {
      type: 'validatorVote',
      action: allActionCases.get('validatorVote'),
    };
  }
  if (allActionCases.has('validatorDefinition')) {
    return {
      type: 'validatorDefinition',
      action: allActionCases.get('validatorDefinition'),
    };
  }
  if (allActionCases.has('ibcRelayAction')) {
    // IBC deposits usually output multiple ibcRelayActions, but the most important of them is MsgRecvPacket
    const depositAction = txv.bodyView?.actionViews.find(
      action =>
        action.actionView.case === 'ibcRelayAction' &&
        action.actionView.value.rawAction?.is(MsgRecvPacket.typeName),
    );

    return {
      type: 'ibcRelayAction',
      action: depositAction ?? allActionCases.get('ibcRelayAction'),
    };
  }
  if (allActionCases.has('proposalSubmit')) {
    return {
      type: 'proposalSubmit',
      action: allActionCases.get('proposalSubmit'),
    };
  }
  if (allActionCases.has('proposalWithdraw')) {
    return {
      type: 'proposalWithdraw',
      action: allActionCases.get('proposalWithdraw'),
    };
  }
  if (allActionCases.has('proposalDepositClaim')) {
    return {
      type: 'proposalDepositClaim',
      action: allActionCases.get('proposalDepositClaim'),
    };
  }
  if (allActionCases.has('positionOpen')) {
    return {
      type: 'positionOpen',
      action: allActionCases.get('positionOpen'),
    };
  }
  if (allActionCases.has('positionClose')) {
    return {
      type: 'positionClose',
      action: allActionCases.get('positionClose'),
    };
  }
  if (allActionCases.has('positionWithdraw')) {
    return {
      type: 'positionWithdraw',
      action: allActionCases.get('positionWithdraw'),
    };
  }
  if (allActionCases.has('positionRewardClaim')) {
    return {
      type: 'positionRewardClaim',
      action: allActionCases.get('positionRewardClaim'),
    };
  }
  if (allActionCases.has('communityPoolSpend')) {
    return {
      type: 'communityPoolSpend',
      action: allActionCases.get('communityPoolSpend'),
    };
  }
  if (allActionCases.has('communityPoolDeposit')) {
    return {
      type: 'communityPoolDeposit',
      action: allActionCases.get('communityPoolDeposit'),
    };
  }
  if (allActionCases.has('communityPoolOutput')) {
    return {
      type: 'communityPoolOutput',
      action: allActionCases.get('communityPoolOutput'),
    };
  }
  if (allActionCases.has('actionLiquidityTournamentVote')) {
    return {
      type: 'liquidityTournamentVote',
      action: allActionCases.get('actionLiquidityTournamentVote'),
    };
  }

  const hasOpaqueSpend = txv.bodyView?.actionViews.some(
    a => a.actionView.case === 'spend' && a.actionView.value.spendView.case === 'opaque',
  );
  const allSpendsVisible = !hasOpaqueSpend;

  // A visible spend whose note is controlled by a visible address is a spend we do control.
  const visibleSpendWithVisibleAddress = txv.bodyView?.actionViews.find(
    a =>
      a.actionView.case === 'spend' &&
      a.actionView.value.spendView.case === 'visible' &&
      a.actionView.value.spendView.value.note?.address?.addressView.case === 'decoded',
  );

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

  // A visible output whose note is controlled by a visible address is an output we do control.
  const visibleOutputWithVisibleAddress = txv.bodyView?.actionViews.find(
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
    if (hasOpaqueSpend && visibleOutputWithVisibleAddress) {
      return {
        type: 'receive',
        action: visibleOutputWithVisibleAddress,
      };
    }
    // If we can see all spends and outputs, it's a transaction we created...
    if (allSpendsVisible && allOutputsVisible) {
      // ... so it's either a send or an internal transfer, depending on whether there's an output we don't control.
      if (isInternal) {
        return {
          type: 'internalTransfer',
          action: visibleOutputWithVisibleAddress ?? visibleSpendWithVisibleAddress,
        };
      } else {
        return {
          type: 'send',
          action: visibleSpendWithVisibleAddress,
        };
      }
    }
  }

  if (isInternal) {
    return {
      type: 'unknownInternal',
    };
  }

  // Fallthrough
  return {
    type: 'unknown',
  };
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
  liquidityTournamentVote: 'Liquidity Tournament Vote',
};

export const getTransactionClassificationLabel = (txv?: TransactionView): string =>
  TRANSACTION_LABEL_BY_CLASSIFICATION[classifyTransaction(txv).type];