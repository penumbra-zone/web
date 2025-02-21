import { FC } from 'react';
import { ActionView as ActionViewMessage } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import { ActionViewType, ActionViewValueType, GetMetadataByAssetId } from './types';
import { UnknownAction } from './actions/unknown';

import { SpendAction } from './actions/spend';
import { OutputAction } from './actions/output';
import { SwapAction } from './actions/swap';
import { SwapClaimAction } from './actions/swap-claim';
import { DelegateAction } from './actions/delegate';
import { DelegatorVoteAction } from './actions/delegator-vote';
import { IbcRelayAction } from './actions/ibc-relay';
import { Ics20WithdrawalAction } from './actions/ics-20-withdrawal';
import { UndelegateAction } from './actions/undelegate';
import { UndelegateClaimAction } from './actions/undelegate-claim';
import { PositionCloseAction } from './actions/position-close';
import { PositionOpenAction } from './actions/position-open';
import { PositionRewardClaimAction } from './actions/position-reward-claim';
import { PositionWithdrawAction } from './actions/position-withdraw';
import { ProposalDepositClaimAction } from './actions/proposal-deposit-claim';
import { ProposalSubmitAction } from './actions/proposal-submit';
import { ProposalWithdrawAction } from './actions/proposal-withdraw';
import { ValidatorDefinitionAction } from './actions/validator-definition';
import { ValidatorVoteAction } from './actions/validator-vote';
import { DutchAuctionEndAction } from './actions/dutch-auction-end';
import { DutchAuctionScheduleAction } from './actions/dutch-auction-schedule';
import { DutchAuctionWithdrawAction } from './actions/dutch-auction-withdraw';
import { CommunityPoolDepositAction } from './actions/community-pool-deposit';
import { CommunityPoolOutputAction } from './actions/community-pool-output';
import { CommunityPoolSpendAction } from './actions/community-pool-spend';

export interface ActionViewProps {
  /**
   * The `ActionViewMessage` protobuf describing an action within a transaction in Penumbra.
   * Can be one of multiple types: Spend, Output, Swap, SwapClaim, etc.
   */
  action: ActionViewMessage;
  /**
   * A helper function that is needed for better fees calculation.
   * Can be omitted, but it generally improves the rendering logic, especially for opaque views.
   */
  getMetadataByAssetId?: GetMetadataByAssetId;
}

const componentMap = {
  spend: SpendAction,
  output: OutputAction,
  swap: SwapAction,
  swapClaim: SwapClaimAction,
  positionOpen: PositionOpenAction,
  positionClose: PositionCloseAction,
  positionWithdraw: PositionWithdrawAction,
  positionRewardClaim: PositionRewardClaimAction,
  // TODO: Implement the actions below
  delegate: DelegateAction,
  delegatorVote: DelegatorVoteAction,
  undelegate: UndelegateAction,
  undelegateClaim: UndelegateClaimAction,
  ibcRelayAction: IbcRelayAction,
  ics20Withdrawal: Ics20WithdrawalAction,
  proposalDepositClaim: ProposalDepositClaimAction,
  proposalSubmit: ProposalSubmitAction,
  proposalWithdraw: ProposalWithdrawAction,
  validatorDefinition: ValidatorDefinitionAction,
  validatorVote: ValidatorVoteAction,
  actionDutchAuctionEnd: DutchAuctionEndAction,
  actionDutchAuctionSchedule: DutchAuctionScheduleAction,
  actionDutchAuctionWithdraw: DutchAuctionWithdrawAction,
  communityPoolDeposit: CommunityPoolDepositAction,
  communityPoolOutput: CommunityPoolOutputAction,
  communityPoolSpend: CommunityPoolSpendAction,
  unknown: UnknownAction,
} as const satisfies Record<ActionViewType | 'unknown', unknown>;

/**
 * In Penumbra, each transaction has 'actions' of different types,
 * representing a blockchain state change performed by a transaction.
 */
export const ActionView = ({ action, getMetadataByAssetId }: ActionViewProps) => {
  const type = action.actionView.case ?? 'unknown';
  const Component = componentMap[type] as FC<{
    value?: ActionViewValueType;
    getMetadataByAssetId?: GetMetadataByAssetId;
  }>;

  return <Component value={action.actionView.value} getMetadataByAssetId={getMetadataByAssetId} />;
};
