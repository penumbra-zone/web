import { ViewBox } from './viewbox';
import { SpendViewComponent } from './spend';
import { OutputViewComponent } from './output';
import { ActionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { SwapViewComponent } from './swap';
import { SwapClaimViewComponent } from './swap-claim';
import { DelegateComponent } from './delegate';
import { UndelegateComponent } from './undelegate';
import { UndelegateClaimComponent } from './undelegate-claim';

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
      return <ViewBox label='ICS20 Withdrawal' />;

    case 'delegate':
      return <DelegateComponent value={actionView.value} />;

    case 'undelegate':
      return <UndelegateComponent value={actionView.value} />;

    case 'undelegateClaim':
      return <UndelegateClaimComponent value={actionView.value} />;

    case 'validatorDefinition':
      return <ViewBox label='Validator Definition' />;

    case 'ibcRelayAction':
      return <ViewBox label='IBC Relay Action' />;

    case 'proposalSubmit':
      return <ViewBox label='Proposal Submit' />;

    case 'proposalWithdraw':
      return <ViewBox label='Proposal Withdraw' />;

    case 'validatorVote':
      return <ViewBox label='Validator Vote' />;

    case 'delegatorVote':
      return <ViewBox label='Delegator Vote' />;

    case 'proposalDepositClaim':
      return <ViewBox label='Proposal Deposit Claim' />;

    case 'positionOpen':
      return <ViewBox label='Position Open' />;

    case 'positionClose':
      return <ViewBox label='Position Close' />;

    case 'positionWithdraw':
      return <ViewBox label='Position Withdraw' />;

    case 'positionRewardClaim':
      return <ViewBox label='Position Reward Claim' />;

    case 'communityPoolSpend':
      return <ViewBox label='Community Spend' />;

    case 'communityPoolOutput':
      return <ViewBox label='Community Output' />;

    case 'communityPoolDeposit':
      return <ViewBox label='Community Deposit' />;

    default:
      return <ViewBox label={getLabelForActionCase(actionView.case)} />;
  }
};
