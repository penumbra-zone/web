import { CommunityPoolOutput } from '@penumbra-zone/protobuf/penumbra/core/component/governance/v1/governance_pb';
import { UnknownAction } from './unknown';

export interface CommunityPoolOutputActionProps {
  value: CommunityPoolOutput;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- unimplemented
export const CommunityPoolOutputAction = (_: CommunityPoolOutputActionProps) => {
  return <UnknownAction label='Community Pool Output' opaque={false} />;
};
