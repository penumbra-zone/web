import { PositionClose } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { UnknownAction } from './unknown';

export interface PositionCloseActionProps {
  value: PositionClose;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- unimplemented
export const PositionCloseAction = (_: PositionCloseActionProps) => {
  return <UnknownAction label='Position Close' opaque={false} />;
};
