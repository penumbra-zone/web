import { TransportEvent, isTransportEvent } from '@penumbra-zone/transport-dom/messages';

export const isTransportInitChannel = (c: unknown): c is TransportInitChannel =>
  isTransportEvent(c) && 'channel' in c && typeof c.channel === 'string'; // sub-channel stream

export interface TransportInitChannel extends TransportEvent {
  channel: string;
}
