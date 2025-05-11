import { ProposalWithdraw } from '@penumbra-zone/protobuf/penumbra/core/component/governance/v1/governance_pb';
import { UnknownAction } from './unknown';

export interface ProposalWithdrawActionProps {
  value: ProposalWithdraw;
}

export const ProposalWithdrawAction = (_: ProposalWithdrawActionProps) => {
  return <UnknownAction label='Proposal Withdraw' opaque={false} />;
};
