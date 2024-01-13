import { ViewBox } from './viewbox';
import { SpendViewComponent } from './spend';
import { OutputViewComponent } from './output';
import { ActionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';

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

    default:
      return <ViewBox label={getLabelForActionCase(actionView.case)} />;
  }
};
