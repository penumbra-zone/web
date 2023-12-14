import { createPromiseClient } from '@connectrpc/connect';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import {
  createChannelTransport,
  ChannelClientLabel,
  InitChannelClientMessage,
  InitChannelClientDataType,
} from '@penumbra-zone/transport';
import { ClientConnectionManager } from '@penumbra-zone/transport/src/chrome-runtime/client-connection-manager';

export const getPenumbraPort = (serviceTypeName: string) => {
  const { port1: port, port2: transferPort } = new MessageChannel();
  const initPort = ClientConnectionManager.init(ChannelClientLabel.Extension);
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

export const grpcClient = createPromiseClient(
  ViewProtocolService,
  createChannelTransport(ViewProtocolService, getPenumbraPort),
);
