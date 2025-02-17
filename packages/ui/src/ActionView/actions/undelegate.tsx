import { Undelegate } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import { UnknownAction } from './unknown';

export interface UndelegateActionProps {
  value: Undelegate;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- unimplemented
export const UndelegateAction = (_: UndelegateActionProps) => {
  return <UnknownAction label='Undelegate' opaque={false} />;
};
