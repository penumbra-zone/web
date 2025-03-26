import { CommunityPoolOutput } from '@penumbra-zone/protobuf/penumbra/core/component/governance/v1/governance_pb';
import { UnknownAction } from './unknown';

export interface CommunityPoolOutputActionProps {
  value: CommunityPoolOutput;
}

export const CommunityPoolOutputAction = (_: CommunityPoolOutputActionProps) => {
  return <UnknownAction label='Community Pool Output' opaque={false} />;
};
