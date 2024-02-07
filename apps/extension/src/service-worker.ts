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

import { jsonOptions } from '@penumbra-zone/types/src/json-options';
import { custodyCtx, servicesCtx } from '@penumbra-zone/router/src/ctx';

import { BackgroundConnectionManager } from '@penumbra-zone/transport/src/chrome-runtime/background-connection-manager';
import { createProxyImpl } from '@penumbra-zone/transport/src/proxy';
import { connectChromeRuntimeAdapter } from '@penumbra-zone/transport/src/chrome-runtime/adapter';

import {
  ConnectError,
  ConnectRouter,
  createContextValues,
  createPromiseClient,
  PromiseClient,
} from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';

// remote service we proxy
import { Query as IbcClientService } from '@buf/cosmos_ibc.connectrpc_es/ibc/core/client/v1/query_connect';

// local services we implement
import { CustodyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1/custody_connect';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { custodyImpl } from '@penumbra-zone/router/src/grpc/custody';
import { viewImpl } from '@penumbra-zone/router/src/grpc/view-protocol-server';

// legacy stdRouter
import { stdRouter } from '@penumbra-zone/router/src/std/router';
import { isStdRequest } from '@penumbra-zone/types';
import { createSameScriptClient } from './clients/extension-service';

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
  [CustodyService, rethrowImplErrors(custodyImpl)],
  [ViewService, rethrowImplErrors(viewImpl)],
  // rpc proxy
  [IbcClientService, ibcImpl],
] as const;

let custodyClient: PromiseClient<typeof CustodyService> | undefined;

// connectrpc adapter
const chromeRuntimeHandler = connectChromeRuntimeAdapter({
  // typeRegistry provides Any-based serialization for the adapter
  jsonOptions,
  // this function is used by the adapter to create routes
  routes: (router: ConnectRouter) =>
    rpcImpls.map(([serviceType, serviceImpl]) => router.service(serviceType, serviceImpl)),
  // this function is used by the adapter to inject contextValues (currently, just a handle to services)
  createRequestContext: req => {
    const contextValues = req.contextValues ?? createContextValues();

    // Dynamically initialize custodyClient when createRequestContext is called,
    // and reuse custody client if it's already been defined.
    custodyClient ??= createSameScriptClient(CustodyService, chromeRuntimeHandler);

    contextValues.set(custodyCtx, custodyClient);
    contextValues.set(servicesCtx, services);
    return Promise.resolve({ ...req, contextValues });
  },
});

// background connection manager handles page connections, streams
BackgroundConnectionManager.init(chromeRuntimeHandler);
