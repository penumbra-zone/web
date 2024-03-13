import {
  TransportEvent,
  TransportMessage,
  isTransportMessage,
  isTransportStream,
} from './messages';
import { ConnectError, createPromiseClient } from '@connectrpc/connect';
import { errorToJson } from '@connectrpc/connect/protocol-connect';
import { ChannelHandlerFn } from './adapter';
import { JsonReadOptions, JsonWriteOptions, ServiceType } from '@bufbuild/protobuf';
import { ChannelTransportOptions, createChannelTransport } from './create';

/**
 * This creates a port for a channelTransport to enter a router, when provided
 * the handler entry function.
 *
 * The returned function satisfies the `getPort` parameter required by
 * `createChannelTransport`.
 *
 * @param entry router entry function
 * @returns a getPort parameter for createChannelTransport
 */

const directGetPort =
  (entry: ChannelHandlerFn, jsonOptions?: Partial<JsonReadOptions> & Partial<JsonWriteOptions>) =>
  (): Promise<MessagePort> => {
    const { port1: servicePort, port2: clientPort } = new MessageChannel();

    // straight-pipe connection, no conditions or transformations
    const directEntryHandler = async ({ requestId, message }: TransportMessage) => {
      const transportResponse: TransportEvent = await entry(message).then(
        response =>
          response instanceof ReadableStream
            ? { requestId, stream: response }
            : { requestId, message: response },
        error => ({
          requestId,
          error: errorToJson(ConnectError.from(error), jsonOptions),
        }),
      );
      servicePort.postMessage(
        transportResponse,
        isTransportStream(transportResponse) ? [transportResponse.stream] : [],
      );
    };

    // TODO: this only supports unary requests
    servicePort.addEventListener('message', (ev: MessageEvent<unknown>) => {
      if (isTransportMessage(ev.data)) void directEntryHandler(ev.data);
      else console.error('Unknown message event', ev);
    });

    // open the port
    servicePort.start();

    // provide client port to the caller
    return Promise.resolve(clientPort);
  };

/**
 * Creates a client for a router that you have the entry function for. This is
 * only useful if you are hosting services and talking to those services in the
 * same script.
 */
export const createDirectClient = <S extends ServiceType>(
  serviceType: S,
  entry: ChannelHandlerFn,
  transportOptions: Omit<ChannelTransportOptions, 'getPort'>,
) =>
  createPromiseClient(
    serviceType,
    createChannelTransport({
      ...transportOptions,
      getPort: directGetPort(entry, transportOptions.jsonOptions),
    }),
  );
