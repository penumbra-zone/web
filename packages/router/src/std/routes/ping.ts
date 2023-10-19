import { PingMessage, SwMessageHandler } from 'penumbra-types';

export const pingHandler: SwMessageHandler<PingMessage> = text => {
  return { ack: `Acknowledged message: ${text}` };
};
