/**
 * This file is the entrypoint for the main and only background service worker.
 *
 * It is responsible for initializing:
 * - Services, with endpoint config and a wallet
 * - the stdRouter for legacy requests
 * - the chromeRuntimeAdapter for routing rpc
 * - the background connection manager for rpc entry
 *
 * Popup is controlled by stdClient by spawnDetachedPopup from
 * @penumbra-zone/types.  Offscreen is controlled by offscreenClient available
 * to rpc implementations in @penumbra-zone/router.
 */

import { Services } from '@penumbra-zone/services';
import { localExtStorage } from '@penumbra-zone/storage';

import { typeRegistry } from '@penumbra-zone/types/src/registry';
import { servicesCtx, custodyCtx } from '@penumbra-zone/router/src/ctx';

import { BackgroundConnectionManager } from '@penumbra-zone/transport/src/chrome-runtime/background-connection-manager';
import { createProxyImpl } from '@penumbra-zone/transport/src/proxy';
import { connectChromeRuntimeAdapter } from '@penumbra-zone/transport/src/chrome-runtime/adapter';

import {
  ConnectError,
  ConnectRouter,
  PromiseClient,
  createContextValues,
  createPromiseClient,
} from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';

// this is a remote service we proxy
import { Query as IbcClientService } from '@buf/cosmos_ibc.connectrpc_es/ibc/core/client/v1/query_connect';

// these are local services we implement
import { CustodyProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1alpha1/custody_connect';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import { custodyImpl } from '@penumbra-zone/router/src/grpc/custody';
import { viewImpl } from '@penumbra-zone/router/src/grpc/view-protocol-server';

// legacy stdRouter
import { stdRouter } from '@penumbra-zone/router/src/std/router';
import { isStdRequest } from '@penumbra-zone/types';
import { ClientConnectionManager } from '@penumbra-zone/transport/src/chrome-runtime/client-connection-manager';
import { ChannelClientLabel, InitChannelClientDataType, InitChannelClientMessage, TransportMessage, TransportStream, createChannelTransport, isTransportData, isTransportMessage } from '@penumbra-zone/transport';

// already inside service worker and have access to router entry (don't need to init)
// leaking listeners? 
// one port for client, one port to listen (pair of ports in message transport)

// const clientListener = (ev: MessageEvent<TransportMessage | TransportStream>) => {
//   try {
//     if (!isTransportData(ev.data)) throw Error('Unknown transport from client');
//     else if (isTransportMessage(ev.data)) servicePort.postMessage(ev.data);
//     else throw Error('Unimplemented request kind');
//   } catch (error) {
//     console.error('Error in client listener', error);
//     clientPort.postMessage({ error });
//   }
// };


// Tal's comments (remove)
// Transport layer is generic to the underlying service
// service-worker to the adapter (listening for rpc requests (client in context is source) coming in on message port)

export const getPenumbraPort = (): MessagePort => {
  const { port1: ourPort, port2: clientPort } = new MessageChannel();
  
  // Attach listener to clientPort
  const eventListener = async (ev: MessageEvent<TransportMessage | TransportStream>) => {
    try {
      if (!isTransportData(ev.data)) throw Error('Unknown transport from client');
      else if (isTransportMessage(ev.data)) {
        const requestId = ev.data.requestId;
        const value = await chromeRuntimeHandler(ev.data.message);

        // Send response to client (check if instance of ReadableStream)
        if (value instanceof ReadableStream) {
          ourPort.postMessage({ requestId, stream: value })
        }
        else {
          // this makes sense
          ourPort.postMessage({ requestId, message: value })
        }
      }
      else throw Error('Unimplemented request kind');
    }
    catch(e) {
      // Catch transport error
      console.log("entered catch clause: ", e)
    } 
  };

  // Attach our event listener
  ourPort.addEventListener("message", eventListener);

  // Start our port
  ourPort.start()
  
  return clientPort;
};

const getCustodyClient = () => {
  return createPromiseClient(
      CustodyProtocolService,
      createChannelTransport({
        defaultTimeoutMs: 10000,
        serviceType: CustodyProtocolService,
        getPort: getPenumbraPort,
      }),
    );
};

// configure and initialize extension services. services are passed directly to stdRouter, and to rpc handlers as context
const grpcEndpoint = await localExtStorage.get('grpcEndpoint');
const servicesConfig = {
  grpcEndpoint,
  getWallet: async () => {
    const wallets = await localExtStorage.get('wallets');
    if (!wallets.length) throw new Error('No wallets connected');
    const { fullViewingKey, id } = wallets[0]!;
    return { walletId: id, fullViewingKey };
  },
};
const services = new Services(servicesConfig);
await services.initialize();

// this only handles stdClient requests
chrome.runtime.onMessage.addListener(
  (
    message: unknown,
    _: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void,
  ) => {
    if (!isStdRequest(message)) return;
    stdRouter(message, sendResponse, services);
    return true;
  },
);

// this is a service proxy
const ibcImpl = createProxyImpl(
  IbcClientService,
  createPromiseClient(IbcClientService, createGrpcWebTransport({ baseUrl: grpcEndpoint })),
);

/**
 * unfortunately, the handler factory in connectrpc suppresses internal errors,
 * unless they are thrown as `ConnectError`.  this is a workaround that wraps
 * impls to rethrow everything as ConnectError before return to the router.
 *
 * would prefer to use `SI extends Partial<ServiceImpl<ServiceType>>` here, but
 * typescript `exactOptionalPropertTypes` and `Partial` interaction is buggy.
 * see: https://github.com/microsoft/TypeScript/issues/46969
 */
const rethrowImplErrors = <SI extends object>(sImpl: SI) =>
  Object.fromEntries(
    Object.entries(sImpl).map(([k, v]) => [
      k,
      (...args: unknown[]) => {
        try {
          const x = (v as (...args: unknown[]) => unknown)(...args);
          if (x instanceof Promise)
            return (x as Promise<unknown>).catch(e => {
              throw ConnectError.from(e);
            });
          return x;
        } catch (e) {
          throw ConnectError.from(e);
        }
      },
    ]),
  ) as typeof sImpl;

const rpcImpls = [
  // rpc we provide
  [CustodyProtocolService, rethrowImplErrors(custodyImpl)],
  [ViewProtocolService, rethrowImplErrors(viewImpl)],
  // rpc proxy
  [IbcClientService, ibcImpl],
] as const;

let custodyClient: PromiseClient<typeof CustodyProtocolService>;

// connectrpc adapter
const chromeRuntimeHandler = connectChromeRuntimeAdapter({
  // typeRegistry provides Any-based serialization for the adapter
  typeRegistry,
  // this function is used by the adapter to create routes
  routes: (router: ConnectRouter) =>
    rpcImpls.map(([serviceType, serviceImpl]) => router.service(serviceType, serviceImpl)),
  // this function is used by the adapter to inject contextValues (currently, just a handle to services)
  createRequestContext: req => {
    const contextValues = req.contextValues ?? createContextValues();

    // Dynamically initialize custodyClient when createRequestContext is called, 
    // It defines top level custody client if undefined, other reuse custody client. 
    custodyClient ??= getCustodyClient();

    contextValues.set(custodyCtx, custodyClient);
    contextValues.set(servicesCtx, services);
    return Promise.resolve({ ...req, contextValues });
  },
});

// background connection manager handles page connections, streams
BackgroundConnectionManager.init(chromeRuntimeHandler);
function async(arg0: (ev: MessageEvent<TransportMessage | TransportStream>) => void) {
  throw new Error('Function not implemented.');
}

