/**
 * This file is the entrypoint for the main and only background service worker.
 *
 * It is responsible for initializing:
 * - Services, with endpoint config and a wallet
 * - the chromeRuntimeAdapter for routing rpc
 * - the background connection manager for rpc entry
 *
 */

import { Services } from '@penumbra-zone/services';
import { localExtStorage, sessionExtStorage } from '@penumbra-zone/storage';

import { servicesControlHandler } from './control/services';
import { typeRegistry } from '@penumbra-zone/types/src/registry';

import {
  custodyImpl,
  viewImpl,
  servicesCtx,
  extLocalCtx,
  extSessionCtx,
  assertWalletIdCtx,
  getTxApprovalCtx,
  buildActionCtx,
} from '@penumbra-zone/router';

import { getTxApproval, assertWalletId, buildAction } from './ctx';

import { BackgroundConnectionManager } from '@penumbra-zone/transport/src/chrome-runtime/background-connection-manager';
import { createProxyImpl } from '@penumbra-zone/transport/src/proxy';
import { connectChromeRuntimeAdapter } from '@penumbra-zone/transport/src/chrome-runtime/adapter';

import {
  ConnectError,
  ConnectRouter,
  createContextValues,
  createPromiseClient,
} from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';

// this is a remote service we proxy
import { Query as IbcClientService } from '@buf/cosmos_ibc.connectrpc_es/ibc/core/client/v1/query_connect';

// these are local services we implement
import { CustodyProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1alpha1/custody_connect';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';

// configure and initialize extension services, passed to rpc impls as context
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
chrome.runtime.onMessage.addListener(servicesControlHandler(services));

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

    contextValues.set(assertWalletIdCtx, assertWalletId);
    contextValues.set(getTxApprovalCtx, getTxApproval);

    contextValues.set(buildActionCtx, buildAction);

    // these are tightly coupled to our extension impl, and should be refactored
    contextValues.set(servicesCtx, services);
    contextValues.set(extLocalCtx, localExtStorage);
    contextValues.set(extSessionCtx, sessionExtStorage);

    return Promise.resolve({ ...req, contextValues });
  },
});

// background connection manager handles page connections, streams
BackgroundConnectionManager.init(chromeRuntimeHandler);
