import { IbcRelay } from '@penumbra-zone/protobuf/penumbra/core/component/ibc/v1/ibc_pb';
import { UnknownAction } from './unknown';

export interface IbcRelayActionProps {
  value: IbcRelay;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- unimplemented
export const IbcRelayAction = (_: IbcRelayActionProps) => {
  return <UnknownAction label='IBC Relay' opaque={false} />;
};
