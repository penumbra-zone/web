import { ViewBox } from './viewbox';
import { SpendViewComponent } from './spend';
import { OutputViewComponent } from './output';
import { ActionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

export const ActionViewComponent = ({ av: { actionView } }: { av: ActionView }) => {
  switch (actionView.case) {
    case 'spend':
      return <SpendViewComponent value={actionView.value} />;

    case 'output':
      return <OutputViewComponent value={actionView.value} />;

    case 'swap':
      return <ViewBox label='Swap' />;

    case 'swapClaim':
      return <ViewBox label='Swap Claim' />;

    case 'ics20Withdrawal':
      return <ViewBox label='ICS20 Withdrawal' />;

    case 'delegate':
      return <ViewBox label='Delegate' />;

    case 'undelegate':
      return <ViewBox label='Undelegate' />;

    case 'undelegateClaim':
      return <ViewBox label='Undelegate Claim' />;

    case 'validatorDefinition':
      return <ViewBox label='Validator Definition' />;

    case 'ibcAction':
      return <ViewBox label='IBC Action' />;

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

    case 'daoSpend':
      return <ViewBox label='DAO Spend' />;

    case 'daoOutput':
      return <ViewBox label='DAO Output' />;

    case 'daoDeposit':
      return <ViewBox label='DAO Deposit' />;

    default:
      return <ViewBox label={String(actionView.case)} />;
  }
};
