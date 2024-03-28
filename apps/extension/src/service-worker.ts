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
import { Services } from '@penumbra-zone/services/src/index';
import { localExtStorage } from '@penumbra-zone/storage/src/chrome/local';

// adapter
import { ConnectRouter, createContextValues, PromiseClient } from '@connectrpc/connect';
import { CRSessionManager } from '@penumbra-zone/transport-chrome/session-manager';
import { createDirectClient } from '@penumbra-zone/transport-dom/src/direct';
import { connectChannelAdapter } from '@penumbra-zone/transport-dom/src/adapter';
import { transportOptions } from '@penumbra-zone/types/src/registry';

// context
import { CustodyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1/custody_connect';
import { QueryService as StakingService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/stake/v1/stake_connect';
import { approverCtx } from '@penumbra-zone/router/src/ctx/approver';
import { custodyCtx } from '@penumbra-zone/router/src/ctx/custody';
import { servicesCtx } from '@penumbra-zone/router/src/ctx/prax';
import { stakingClientCtx } from '@penumbra-zone/router/src/ctx/staking-client';
import { approveTransaction } from './approve-transaction';

// all rpc implementations, local and proxy
import { rpcImpls } from './impls';
import { backOff } from 'exponential-backoff';
import {FullViewingKey, WalletId} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb";

const startServices = async () => {
  const grpcEndpoint = await localExtStorage.get('grpcEndpoint');

  const wallet0 = (await localExtStorage.get('wallets'))[0];
  if (!wallet0) throw new Error('No wallet found');

  const services = new Services({
    idbVersion: IDB_VERSION,
    grpcEndpoint,
    walletId: WalletId.fromJsonString(wallet0.id),
    fullViewingKey: FullViewingKey.fromJsonString(wallet0.fullViewingKey),
    numeraireAssetId: USDC_ASSET_ID,
  });
  await services.initialize();
  return services;
};

const services = await backOff(startServices, {
  retry: (e, attemptNumber) => {
    if (process.env['NODE_ENV'] === 'development')
      console.warn("Prax couldn't start ", attemptNumber, e);
    return true;
  },
});

let custodyClient: PromiseClient<typeof CustodyService> | undefined;
let stakingClient: PromiseClient<typeof StakingService> | undefined;
const handler = connectChannelAdapter({
  // jsonOptions contains typeRegistry providing ser/de
  jsonOptions: transportOptions.jsonOptions,

  /** @see https://connectrpc.com/docs/node/implementing-services */
  routes: (router: ConnectRouter) =>
    rpcImpls.map(([serviceType, serviceImpl]) => router.service(serviceType, serviceImpl)),

  // context so impls can access storage, ui, other services, etc
  createRequestContext: req => {
    const contextValues = req.contextValues ?? createContextValues();

    // dynamically initialize clients, or reuse if already available
    custodyClient ??= createDirectClient(CustodyService, handler, transportOptions);
    stakingClient ??= createDirectClient(StakingService, handler, transportOptions);

    contextValues.set(custodyCtx, custodyClient);
    contextValues.set(stakingClientCtx, stakingClient);
    contextValues.set(servicesCtx, services);
    contextValues.set(approverCtx, approveTransaction);

    return Promise.resolve({ ...req, contextValues });
  },
});

// everything is ready to go.
// session manager listens for page connections
CRSessionManager.init(PRAX, handler);
