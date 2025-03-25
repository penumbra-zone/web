import { UnknownAction } from './unknown';
import { UndelegateClaim } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';

export interface UndelegateClaimActionProps {
  value: UndelegateClaim;
}

export const UndelegateClaimAction = (_: UndelegateClaimActionProps) => {
  return <UnknownAction label='Swap Claim' opaque={false} />;
};
