import { FC } from 'react';
import { ActionView as ActionViewMessage } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { ActionViewType, ActionViewValueType } from './types';
import { UnknownAction } from './actions/unknown';

import { SpendAction } from './actions/spend';
import { OutputAction } from './actions/output';
import { SwapAction } from './actions/swap';
import { SwapClaimAction } from './actions/swap-claim';

export interface ActionViewProps {
  action: ActionViewMessage;
}

const componentMap = {
  spend: SpendAction,
  output: OutputAction,
  swap: SwapAction,
  // TODO: Implement the actions below
  swapClaim: SwapClaimAction,
  delegate: UnknownAction,
  delegatorVote: UnknownAction,
  ibcRelayAction: UnknownAction,
  ics20Withdrawal: UnknownAction,
  positionClose: UnknownAction,
  positionOpen: UnknownAction,
  positionRewardClaim: UnknownAction,
  positionWithdraw: UnknownAction,
  proposalDepositClaim: UnknownAction,
  proposalSubmit: UnknownAction,
  proposalWithdraw: UnknownAction,
  undelegate: UnknownAction,
  undelegateClaim: UnknownAction,
  validatorDefinition: UnknownAction,
  validatorVote: UnknownAction,
  actionDutchAuctionEnd: UnknownAction,
  actionDutchAuctionSchedule: UnknownAction,
  actionDutchAuctionWithdraw: UnknownAction,
  communityPoolDeposit: UnknownAction,
  communityPoolOutput: UnknownAction,
  communityPoolSpend: UnknownAction,
  unknown: UnknownAction,
} as const satisfies Record<ActionViewType | 'unknown', unknown>;

/**
 * In Penumbra, each transaction has 'actions' of different types,
 * representing a blockchain state change performed by a transaction.
 */
export const ActionView = ({ action }: ActionViewProps) => {
  const type = action.actionView.case ?? 'unknown';
  const Component = componentMap[type] as FC<{ value?: ActionViewValueType }>;

  return <Component value={action.actionView.value} />;
};
