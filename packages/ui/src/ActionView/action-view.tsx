import { ActionView as ActionViewMessage } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { ActionViewType, ActionViewValueType } from './types';
import { UnknownAction } from './unknown';

import { SpendAction } from './actions/spend';
import { OutputAction } from './actions/output';
import { FC } from 'react';

export interface ActionViewProps {
  action: ActionViewMessage;
}

const componentMap = {
  spend: SpendAction,
  output: OutputAction,
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
  swap: UnknownAction,
  swapClaim: UnknownAction,
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
