import type {
  InitChannelClientDataType,
  InitChannelClientMessage,
} from '@penumbra-zone/transport/src/types';

import type { Exposed } from '@penumbra-zone/types/src/penumbra-global';

const penumbra = Symbol.for('penumbra');

declare global {
  interface Window {
    [penumbra]?: Exposed;
  }
}

export const getPenumbraPort = (serviceTypeName: string) => {
  const { port1: port, port2: transferPort } = new MessageChannel();
  if (!(penumbra in window)) throw Error('No Penumbra global (extension not installed)');
  const initPort = window[penumbra]?.services?.[serviceTypeName];
  if (!initPort) throw Error(`No init port for service ${serviceTypeName}`);
  initPort.postMessage(
    {
      type: 'INIT_CHANNEL_CLIENT' as typeof InitChannelClientDataType,
      port: transferPort,
      service: serviceTypeName,
    } as InitChannelClientMessage,
    [transferPort],
  );
  return port;
};
