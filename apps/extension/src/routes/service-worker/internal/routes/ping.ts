import { SwMessage, SwMessageHandler } from '../types';

export interface PongResponse {
  ack: string;
}

export type PingMessage = SwMessage<'PING', string, PongResponse>;

export const pingHandler: SwMessageHandler<PingMessage> = text => {
  return { ack: `Acknowledged message: ${text}` };
};
