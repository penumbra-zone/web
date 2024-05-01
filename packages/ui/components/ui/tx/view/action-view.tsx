import { SpendViewComponent } from './spend';
import { OutputViewComponent } from './output';
import { ActionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { SwapClaimViewComponent } from './swap-claim';
import { DelegateComponent } from './delegate';
import { UndelegateComponent } from './undelegate';
import { UndelegateClaimComponent } from './undelegate-claim';
import { Ics20WithdrawalComponent } from './isc20-withdrawal';
import { UnimplementedView } from './unimplemented-view';
import { SwapViewComponent } from './swap';
import { ActionDutchAuctionScheduleViewComponent } from './action-dutch-auction-schedule-view';

const CASE_TO_LABEL: Record<string, string> = {
  daoDeposit: 'DAO Deposit',
  daoOutput: 'DAO Output',
  daoSpend: 'DAO Spend',
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
};

const getLabelForActionCase = (actionCase: string | undefined): string => {
  if (!actionCase) return '';

  const label = CASE_TO_LABEL[actionCase];
  if (label) return label;

  return String(actionCase);
};

export const ActionViewComponent = ({ av: { actionView } }: { av: ActionView }) => {
  switch (actionView.case) {
    case 'spend':
      return <SpendViewComponent value={actionView.value} />;

    case 'output':
      return <OutputViewComponent value={actionView.value} />;

    case 'swap':
      return <SwapViewComponent value={actionView.value} />;

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

    case 'validatorDefinition':
      return <UnimplementedView label='Validator Definition' />;

    case 'ibcRelayAction':
      return <UnimplementedView label='IBC Relay Action' />;

    case 'proposalSubmit':
      return <UnimplementedView label='Proposal Submit' />;

    case 'proposalWithdraw':
      return <UnimplementedView label='Proposal Withdraw' />;

    case 'validatorVote':
      return <UnimplementedView label='Validator Vote' />;

    case 'delegatorVote':
      return <UnimplementedView label='Delegator Vote' />;

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
