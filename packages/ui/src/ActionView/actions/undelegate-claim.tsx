import { UnknownAction } from './unknown';
import { UndelegateClaim } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';

export interface UndelegateClaimActionProps {
  value: UndelegateClaim;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- unimplemented
export const UndelegateClaimAction = (_: UndelegateClaimActionProps) => {
  return <UnknownAction label='Swap Claim' opaque={false} />;
};
