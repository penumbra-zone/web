import { PingMessage } from '@penumbra-zone/types';
import { InternalMessageHandler } from '@penumbra-zone/types/src/internal-msg/shared';

export const pingHandler: InternalMessageHandler<PingMessage> = text => {
  return { ack: `Acknowledged message: ${text}` };
};
