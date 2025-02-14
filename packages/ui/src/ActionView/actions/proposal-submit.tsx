import { ProposalSubmit } from '@penumbra-zone/protobuf/penumbra/core/component/governance/v1/governance_pb';
import { UnknownAction } from './unknown';

export interface ProposalSubmitActionProps {
  value: ProposalSubmit;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- unimplemented
export const ProposalSubmitAction = (_: ProposalSubmitActionProps) => {
  return <UnknownAction label='Proposal Submit' opaque={false} />;
};
