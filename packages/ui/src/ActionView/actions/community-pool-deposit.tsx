import { CommunityPoolDeposit } from '@penumbra-zone/protobuf/penumbra/core/component/governance/v1/governance_pb';
import { UnknownAction } from './unknown';

export interface CommunityPoolDepositActionProps {
  value: CommunityPoolDeposit;
}

export const CommunityPoolDepositAction = (_: CommunityPoolDepositActionProps) => {
  return <UnknownAction label='Community Pool Deposit' opaque={false} />;
};
