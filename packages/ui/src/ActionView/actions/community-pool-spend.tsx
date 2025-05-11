import { CommunityPoolSpend } from '@penumbra-zone/protobuf/penumbra/core/component/governance/v1/governance_pb';
import { UnknownAction } from './unknown';

export interface CommunityPoolSpendActionProps {
  value: CommunityPoolSpend;
}

export const CommunityPoolSpendAction = (_: CommunityPoolSpendActionProps) => {
  return <UnknownAction label='Community Pool Spend' opaque={false} />;
};
