import { isTransportEvent, TransportEvent } from '@penumbra-zone/transport-dom/messages';

export const isTransportInitChannel = (c: unknown, id?: string): c is TransportInitChannel =>
  isTransportEvent(c, id) && 'channel' in c && typeof c.channel === 'string'; // sub-channel stream

export interface TransportInitChannel extends TransportEvent {
  channel: string;
}
