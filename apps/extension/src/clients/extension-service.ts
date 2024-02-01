import { ServiceType } from '@bufbuild/protobuf';
import { ConnectError, createPromiseClient } from '@connectrpc/connect';
import { errorToJson } from '@connectrpc/connect/protocol-connect';
import {
  TransportEvent,
  TransportMessage,
  createChannelTransport,
  isTransportMessage,
} from '@penumbra-zone/transport';
import { ChromeRuntimeHandlerFn } from '@penumbra-zone/transport/src/chrome-runtime/adapter';
import { jsonOptions } from '@penumbra-zone/types/src/json-options';
import { transportOptions } from './transport-options';

/**
 * This enables a channelTransport to communicate directly with a router running
 * in the same script. This means communication between happens within the same JavaScript
 * context / environment within a JavaScript runtime, allowing them to interact directly
 * without going through external communication mechanisms like the connection manager.
 * Given router entry, the returned function satisfies the `getPort` parameter
 * required by `createChannelTransport`.
 *
 * TODO: this could probably be provided by ClientConnectionManager
 *
 * @param entry router entry function
 * @returns getPort parameter for creating a channel client
 */
export const directEntry = (entry: ChromeRuntimeHandlerFn) => (): MessagePort => {
  const { port1: ourPort, port2: clientPort } = new MessageChannel();

  // straight-pipe equivalent to connection manager
  const directEntryHandler = async ({ requestId, message }: TransportMessage) => {
    const transportResponse: TransportEvent = await entry(message)
      .then(response =>
        response instanceof ReadableStream
          ? { requestId, stream: response }
          : { requestId, message: response },
      )
      .catch(error => ({
        requestId,
        error: errorToJson(ConnectError.from(error), jsonOptions),
      }));
    ourPort.postMessage(transportResponse);
  };

  // Attach event listener for rpc requests to ourPort, which will
  // be triggered when a message is recieved on the port from the client
  ourPort.addEventListener('message', (ev: MessageEvent<unknown>) => {
    if (isTransportMessage(ev.data)) void directEntryHandler(ev.data);
    else console.error('Unknown message event', ev);
  });

  // acknowledge connection
  ourPort.postMessage({ connected: true });

  // open the port
  ourPort.start();

  // provide client port to the caller
  return clientPort;
};

export const createSameScriptClient = <S extends ServiceType>(
  serviceType: S,
  entry: ChromeRuntimeHandlerFn,
) =>
  createPromiseClient(
    serviceType,
    createChannelTransport({
      ...transportOptions,
      serviceType,
      getPort: directEntry(entry),
    }),
  );
