import { PositionOpen } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { UnknownAction } from './unknown';

export interface PositionOpenActionProps {
  value: PositionOpen;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- unimplemented
export const PositionOpenAction = (_: PositionOpenActionProps) => {
  return <UnknownAction label='Position Open' opaque={false} />;
};
