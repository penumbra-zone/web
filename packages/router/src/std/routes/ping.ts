import { PingMessage, SwMessageHandler } from '@penumbra-zone/types';

export const pingHandler: SwMessageHandler<PingMessage> = text => {
  return { ack: `Acknowledged message: ${text}` };
};
