import { ValidatorVote } from '@penumbra-zone/protobuf/penumbra/core/component/governance/v1/governance_pb';
import { UnknownAction } from './unknown';

export interface ValidatorVoteActionProps {
  value: ValidatorVote;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- unimplemented
export const ValidatorVoteAction = (_: ValidatorVoteActionProps) => {
  return <UnknownAction label='Delegator Vote' opaque={false} />;
};
