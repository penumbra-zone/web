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
import { Services } from '@penumbra-zone/services-context';
import { localExtStorage } from '@penumbra-zone/storage/chrome/local';

// adapter
import { ConnectRouter, createContextValues, PromiseClient } from '@connectrpc/connect';
import { CRSessionManager } from '@penumbra-zone/transport-chrome/session-manager';
import { createDirectClient } from '@penumbra-zone/transport-dom/src/direct';
import { connectChannelAdapter } from '@penumbra-zone/transport-dom/src/adapter';
import { transportOptions } from '@penumbra-zone/types/src/registry';

// context
import { CustodyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1/custody_connect';
import { QueryService as StakingService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/stake/v1/stake_connect';
import { approverCtx } from '@penumbra-zone/services/ctx/approver';
import { custodyCtx } from '@penumbra-zone/services/ctx/custody';
import { servicesCtx } from '@penumbra-zone/services/ctx/prax';
import { stakingClientCtx } from '@penumbra-zone/services/ctx/staking-client';
import { approveTransaction } from './approve-transaction';

// all rpc implementations, local and proxy
import { getRpcImpls } from './get-rpc-impls';
import { backOff } from 'exponential-backoff';
import {
  FullViewingKey,
  WalletId,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

/**
 * When a user first onboards with the extension, they won't have chosen a gRPC
 * endpoint yet. So we'll wait until they've chosen one to start trying to make
 * requests against it.
 */
const waitUntilGrpcEndpointExists = async () => {
  const grpcEndpointPromise = Promise.withResolvers();
  const grpcEndpoint = await localExtStorage.get('grpcEndpoint');

  if (grpcEndpoint) {
    grpcEndpointPromise.resolve();
  } else {
    const listener = (changes: Record<string, { newValue?: unknown }>) => {
      if (changes['grpcEndpoint']?.newValue) {
        grpcEndpointPromise.resolve();
        localExtStorage.removeListener(listener);
      }
    };
    localExtStorage.addListener(listener);
  }

  return grpcEndpointPromise.promise;
};

const startServices = async () => {
  const grpcEndpoint = await localExtStorage.get('grpcEndpoint');

  const wallet0 = (await localExtStorage.get('wallets'))[0];
  if (!wallet0) throw new Error('No wallet found');

  const services = new Services({
    idbVersion: IDB_VERSION,
    grpcEndpoint,
    walletId: WalletId.fromJsonString(wallet0.id),
    fullViewingKey: FullViewingKey.fromJsonString(wallet0.fullViewingKey),
  });
  await services.initialize();
  return services;
};

const getServiceHandler = async () => {
  const services = await backOff(startServices, {
    retry: (e, attemptNumber) => {
      if (process.env['NODE_ENV'] === 'development')
        console.warn("Prax couldn't start ", attemptNumber, e);
      return true;
    },
  });

  const rpcImpls = await getRpcImpls();
  let custodyClient: PromiseClient<typeof CustodyService> | undefined;
  let stakingClient: PromiseClient<typeof StakingService> | undefined;
  return connectChannelAdapter({
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
};

await waitUntilGrpcEndpointExists();
const handler = await getServiceHandler();
CRSessionManager.init(PRAX, handler);
