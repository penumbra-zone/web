import { PositionWithdraw } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { UnknownAction } from './unknown';

export interface PositionWithdrawActionProps {
  value: PositionWithdraw;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- unimplemented
export const PositionWithdrawAction = (_: PositionWithdrawActionProps) => {
  return <UnknownAction label='Position Withdraw' opaque={false} />;
};
