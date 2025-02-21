import { PositionRewardClaim } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { UnknownAction } from '../actions/unknown';

export interface PositionRewardClaimActionProps {
  value: PositionRewardClaim;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- unimplemented
export const PositionRewardClaimAction = (_: PositionRewardClaimActionProps) => {
  return <UnknownAction label='Position Reward Claim' opaque={false} />;
};
