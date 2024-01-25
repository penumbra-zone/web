import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import { ServiceType } from '@bufbuild/protobuf';
import { createPromiseClient } from '@connectrpc/connect';
import {
  ChannelClientLabel,
  InitChannelClientDataType,
  InitChannelClientMessage,
  createChannelTransport,
} from '@penumbra-zone/transport';
import { ClientConnectionManager } from '@penumbra-zone/transport/src/chrome-runtime/client-connection-manager';
import { transportOptions } from './transport-options';

/**
 * This enables a channelTransport running in a page displayed by the extension
 * to communicate with the extension's services through the chrome runtime, by
 * activating a simplified local ClientConnectionManager. This function satisfies
 * the `getPort` parameter required by `createChannelTransport`.
 *
 * @returns MessagePort
 */
export const getExtensionPagePort = () => {
  console.log('entered getExtensionPagePort');
  const { port1: port, port2: transferPort } = new MessageChannel();
  const initPort = ClientConnectionManager.init(ChannelClientLabel.Extension);
  initPort.postMessage(
    {
      type: 'INIT_CHANNEL_CLIENT' as typeof InitChannelClientDataType,
      port: transferPort,
    } as InitChannelClientMessage,
    [transferPort],
  );
  return port;
};

export const createExtensionPageClient = <S extends ServiceType>(serviceType: S) =>
  createPromiseClient(
    serviceType,
    createChannelTransport({
      ...transportOptions,
      serviceType,
      getPort: getExtensionPagePort,
    }),
  );

// `ExtensionPage` refers to a webpage, for instance a content script or popup page, associated with the extension,
// and we initialize a client object for establishing communication with the extension's services.
export const viewClient = createExtensionPageClient(ViewProtocolService);
