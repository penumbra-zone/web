/**
 * This file is the entrypoint for the main and only background service worker.
 *
 * It is responsible for initializing:
 * - listeners for chrome runtime events
 * - Services, with endpoint config and a wallet
 * - rpc services, router, and adapter
 * - session manager for rpc entry
 */

// side-effectful import attaches transport init listeners
import './listeners';

// services
import { Services } from '@penumbra-zone/services';
import { localExtStorage } from '@penumbra-zone/storage';

// adapter
import { ConnectRouter, PromiseClient, createContextValues } from '@connectrpc/connect';
import { CRSessionManager } from '@penumbra-zone/transport-chrome/session-manager';
import { connectChannelAdapter } from '@penumbra-zone/transport-dom/adapter';
import { transportOptions } from '@penumbra-zone/types/registry';

// context
import { CustodyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1/custody_connect';
import { approverCtx, custodyCtx, servicesCtx } from '@penumbra-zone/router/src/ctx';
import { createDirectClient } from '@penumbra-zone/transport-dom/direct';
import { approveTransaction } from './approve-transaction';

// all rpc implementations, local and proxy
import { rpcImpls } from './impls';

console.error('TODO: remove before merge');
void localExtStorage.set('connectedSites', []);

const services = new Services({
  idbVersion: IDB_VERSION,
  grpcEndpoint: await localExtStorage.get('grpcEndpoint'),
  getWallet: async () => {
    const wallets = await localExtStorage.get('wallets');
    if (!wallets[0]) throw new Error('No wallets connected');
    const { fullViewingKey, id } = wallets[0];
    return { walletId: id, fullViewingKey };
  },
});
await services.initialize();

let custodyClient: PromiseClient<typeof CustodyService> | undefined;
const handler = connectChannelAdapter({
  // jsonOptions contains typeRegistry providing ser/de
  jsonOptions: transportOptions.jsonOptions,

  /** @see https://connectrpc.com/docs/node/implementing-services */
  routes: (router: ConnectRouter) =>
    rpcImpls.map(([serviceType, serviceImpl]) => router.service(serviceType, serviceImpl)),

  // context so impls can access storage, ui, other services, etc
  createRequestContext: req => {
    const contextValues = req.contextValues ?? createContextValues();

    // dynamically initialize custodyClient, or reuse if it's already available
    custodyClient ??= createDirectClient(CustodyService, handler, transportOptions);

    contextValues.set(custodyCtx, custodyClient);
    contextValues.set(servicesCtx, services);
    contextValues.set(approverCtx, approveTransaction);

    return Promise.resolve({ ...req, contextValues });
  },
});

// everything is ready to go.
// session manager listens for page connections
CRSessionManager.init(PRAX, handler);
