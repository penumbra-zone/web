import { Delegate } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import { UnknownAction } from './unknown';

export interface DelegateActionProps {
  value: Delegate;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- unimplemented
export const DelegateAction = (_: DelegateActionProps) => {
  return <UnknownAction label='Delegate' opaque={false} />;
};
