import { SpendViewComponent } from './actions-views/spend';
import { OutputViewComponent } from './actions-views/output';
import { ActionView, ValueView } from '@penumbra-zone/protobuf/types';
import { SwapClaimViewComponent } from './actions-views/swap/swap-claim';
import { DelegateComponent } from './actions-views/delegate';
import { UndelegateComponent } from './actions-views/undelegate';
import { UndelegateClaimComponent } from './actions-views/undelegate-claim';
import { Ics20WithdrawalComponent } from './actions-views/isc20-withdrawal';
import { UnimplementedView } from './actions-views/unimplemented-view';
import { SwapViewComponent } from './actions-views/swap';
import { ActionDutchAuctionScheduleViewComponent } from './actions-views/action-dutch-auction-schedule-view';
import { ActionDutchAuctionEndComponent } from './actions-views/action-dutch-auction-end';
import { ActionDutchAuctionWithdrawViewComponent } from './actions-views/action-dutch-auction-withdraw-view';
import { DelegatorVoteComponent } from './actions-views/delegator-vote.tsx';
import { ValidatorVoteComponent } from './actions-views/validator-vote.tsx';

type Case = Exclude<ActionView['actionView']['case'], undefined>;

const CASE_TO_LABEL: Record<Case, string> = {
  output: 'Output',
  spend: 'Spend',
  delegate: 'Delegate',
  delegatorVote: 'Delegator Vote',
  ibcRelayAction: 'IBC Relay Action',
  ics20Withdrawal: 'ICS20 Withdrawal',
  positionClose: 'Position Close',
  positionOpen: 'Position Open',
  positionRewardClaim: 'Position Reward Claim',
  positionWithdraw: 'Position Withdraw',
  proposalDepositClaim: 'Proposal Deposit Claim',
  proposalSubmit: 'Proposal Submit',
  proposalWithdraw: 'Proposal Withdraw',
  swap: 'Swap',
  swapClaim: 'Swap Claim',
  undelegate: 'Undelegate',
  undelegateClaim: 'Undelegate Claim',
  validatorDefinition: 'Validator Definition',
  validatorVote: 'Validator Vote',
  actionDutchAuctionEnd: 'Dutch Auction End',
  actionDutchAuctionSchedule: 'Dutch Auction Schedule',
  actionDutchAuctionWithdraw: 'Dutch Auction Withdraw',
  communityPoolDeposit: 'Community Pool Deposit',
  communityPoolOutput: 'Community Pool Output',
  communityPoolSpend: 'Community Pool Spend',
};

const getLabelForActionCase = (actionCase: ActionView['actionView']['case']): string => {
  if (!actionCase) {
    return '';
  }

  const label = CASE_TO_LABEL[actionCase];
  if (label) {
    return label;
  }

  return String(actionCase);
};

export const ActionViewComponent = ({
  av: { actionView },
  feeValueView,
}: {
  av: ActionView;
  feeValueView: ValueView;
}) => {
  switch (actionView.case) {
    case 'spend':
      return <SpendViewComponent value={actionView.value} />;

    case 'output':
      return <OutputViewComponent value={actionView.value} />;

    case 'swap':
      return <SwapViewComponent value={actionView.value} feeValueView={feeValueView} />;

    case 'swapClaim':
      return <SwapClaimViewComponent value={actionView.value} />;

    case 'ics20Withdrawal':
      return <Ics20WithdrawalComponent value={actionView.value} />;

    case 'delegate':
      return <DelegateComponent value={actionView.value} />;

    case 'undelegate':
      return <UndelegateComponent value={actionView.value} />;

    case 'undelegateClaim':
      return <UndelegateClaimComponent value={actionView.value} />;

    case 'actionDutchAuctionSchedule':
      return <ActionDutchAuctionScheduleViewComponent value={actionView.value} />;

    case 'actionDutchAuctionEnd':
      return <ActionDutchAuctionEndComponent value={actionView.value} />;

    case 'actionDutchAuctionWithdraw':
      return <ActionDutchAuctionWithdrawViewComponent value={actionView.value} />;

    case 'delegatorVote':
      return <DelegatorVoteComponent value={actionView.value} />;

    case 'validatorVote':
      return <ValidatorVoteComponent value={actionView.value} />;

    case 'validatorDefinition':
      return <UnimplementedView label='Validator Definition' />;

    case 'ibcRelayAction':
      return <UnimplementedView label='IBC Relay Action' />;

    case 'proposalSubmit':
      return <UnimplementedView label='Proposal Submit' />;

    case 'proposalWithdraw':
      return <UnimplementedView label='Proposal Withdraw' />;

    case 'proposalDepositClaim':
      return <UnimplementedView label='Proposal Deposit Claim' />;

    case 'positionOpen':
      return <UnimplementedView label='Position Open' />;

    case 'positionClose':
      return <UnimplementedView label='Position Close' />;

    case 'positionWithdraw':
      return <UnimplementedView label='Position Withdraw' />;

    case 'positionRewardClaim':
      return <UnimplementedView label='Position Reward Claim' />;

    case 'communityPoolSpend':
      return <UnimplementedView label='Community Spend' />;

    case 'communityPoolOutput':
      return <UnimplementedView label='Community Output' />;

    case 'communityPoolDeposit':
      return <UnimplementedView label='Community Deposit' />;

    default:
      return <UnimplementedView label={getLabelForActionCase(actionView.case)} />;
  }
};
