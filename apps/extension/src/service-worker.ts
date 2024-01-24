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

// transport layer which is generic to the underlying service type
import { TransportMessage, TransportStream, createChannelTransport, isTransportData, isTransportMessage } from '@penumbra-zone/transport';

// remote service we proxy
import { Query as IbcClientService } from '@buf/cosmos_ibc.connectrpc_es/ibc/core/client/v1/query_connect';

// local services we implement
import { CustodyProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1alpha1/custody_connect';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import { custodyImpl } from '@penumbra-zone/router/src/grpc/custody';
import { viewImpl } from '@penumbra-zone/router/src/grpc/view-protocol-server';

// legacy stdRouter
import { stdRouter } from '@penumbra-zone/router/src/std/router';
import { isStdRequest } from '@penumbra-zone/types';

// Since we're already operating in the background service worker, we have access to 
// the router entry and don't need to explicitly init the client connection manager. 
export const getPenumbraPort = (): MessagePort => {
  const { port1: ourPort, port2: clientPort } = new MessageChannel();
  
  // Asynchronous event listener that handles messages recieved on the clientPort
  const eventListener = async (ev: MessageEvent<TransportMessage | TransportStream>) => {
    try {
      if (!isTransportData(ev.data)) throw Error('Unknown transport from client');
      else if (isTransportMessage(ev.data)) {
        const requestId = ev.data.requestId;
        const value = await chromeRuntimeHandler(ev.data.message);
        
        // Post message to clientPort
        if (value instanceof ReadableStream) {
          ourPort.postMessage({ requestId, stream: value })
        }
        else {
          ourPort.postMessage({ requestId, message: value })
        }
      }
      else throw Error('Unimplemented request kind');
    }
    catch(error) {
      // Handle and log the error in a more informative way
      console.error('Error in eventListener:', error);
    } 
  };

  // Attach event listener for rpc requests to the ourPort, which will 
  // be triggered when a message is recieved on the port from the source
  // client context
  ourPort.addEventListener("message", eventListener);
  ourPort.postMessage({ connected: true });

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
              console.error('Error in impl:', e);
              throw ConnectError.from(e);
            });
          return x;
        } catch (e) {
          console.error('Error in impl:', e);
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
    // and reuse custody client if it's already been defined. 
    custodyClient ??= getCustodyClient();

    contextValues.set(custodyCtx, custodyClient);
    contextValues.set(servicesCtx, services);
    return Promise.resolve({ ...req, contextValues });
  },
});

// background connection manager handles page connections, streams
BackgroundConnectionManager.init(chromeRuntimeHandler);