import { Undelegate } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import { UnknownAction } from './unknown';

export interface UndelegateActionProps {
  value: Undelegate;
}

export const UndelegateAction = (_: UndelegateActionProps) => {
  return <UnknownAction label='Undelegate' opaque={false} />;
};
