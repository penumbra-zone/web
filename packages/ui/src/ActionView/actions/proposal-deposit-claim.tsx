import { ProposalDepositClaim } from '@penumbra-zone/protobuf/penumbra/core/component/governance/v1/governance_pb';
import { UnknownAction } from './unknown';

export interface ProposalDepositClaimActionProps {
  value: ProposalDepositClaim;
}

export const ProposalDepositClaimAction = (_: ProposalDepositClaimActionProps) => {
  return <UnknownAction label='Proposal Deposit Claim' opaque={false} />;
};
