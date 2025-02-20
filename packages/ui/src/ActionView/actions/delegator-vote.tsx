import { DelegatorVoteView } from '@penumbra-zone/protobuf/penumbra/core/component/governance/v1/governance_pb';
import { UnknownAction } from './unknown';

export interface DelegatorVoteActionProps {
  value: DelegatorVoteView;
}

export const DelegatorVoteAction = ({ value }: DelegatorVoteActionProps) => {
  return <UnknownAction label='Delegator Vote' opaque={value.delegatorVote.case === 'opaque'} />;
};
