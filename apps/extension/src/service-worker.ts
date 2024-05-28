/**
 * This file is the entrypoint for the main and only background service worker.
 *
 * It is responsible for initializing:
 * - listeners for chrome runtime events
 * - Services, with endpoint config and a wallet
 * - rpc services, router, and adapter
 * - session manager for rpc entry
 */

// side-effectful import attaches listeners
import './listeners';

// services
import { Services } from '@penumbra-zone/services-context';
import { backOff } from 'exponential-backoff';

// all rpc implementations, local and proxy
import { getRpcImpls } from './get-rpc-impls';

// adapter
import { ConnectRouter, createContextValues, PromiseClient } from '@connectrpc/connect';
import { jsonOptions } from '@penumbra-zone/protobuf';
import { CRSessionManager } from '@penumbra-zone/transport-chrome/session-manager';
import { connectChannelAdapter } from '@penumbra-zone/transport-dom/adapter';

// context
import { approverCtx } from '@penumbra-zone/services/ctx/approver';
import { fvkCtx } from '@penumbra-zone/services/ctx/full-viewing-key';
import { servicesCtx } from '@penumbra-zone/services/ctx/prax';
import { skCtx } from '@penumbra-zone/services/ctx/spend-key';
import { approveTransaction } from './approve-transaction';
import { getFullViewingKey } from './ctx/full-viewing-key';
import { getSpendKey } from './ctx/spend-key';

// context clients
import { QueryService as StakingService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/stake/v1/stake_connect';
import { CustodyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1/custody_connect';
import { custodyClientCtx } from '@penumbra-zone/services/ctx/custody-client';
import { stakingClientCtx } from '@penumbra-zone/services/ctx/staking-client';
import { createDirectClient } from '@penumbra-zone/transport-dom/direct';

// storage
import {
  FullViewingKey,
  WalletId,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import type { WalletJson } from '@penumbra-zone/types/wallet';
import {
  fixEmptyGrpcEndpointAfterOnboarding,
  onboardGrpcEndpoint,
  onboardWallet,
} from './storage/onboard';

const startServices = async (wallet: WalletJson) => {
  const grpcEndpoint = await onboardGrpcEndpoint();
  const services = new Services({
    idbVersion: IDB_VERSION,
    grpcEndpoint,
    walletId: WalletId.fromJsonString(wallet.id),
    fullViewingKey: FullViewingKey.fromJsonString(wallet.fullViewingKey),
  });
  await services.initialize();

  return services;
};

const getServiceHandler = async () => {
  const wallet = await onboardWallet();
  const services = backOff(() => startServices(wallet), {
    retry: (e, attemptNumber) => {
      console.log("Prax couldn't start services-context", attemptNumber, e);
      return true;
    },
  });

  const grpcEndpoint = await onboardGrpcEndpoint();
  const rpcImpls = getRpcImpls(grpcEndpoint);

  let custodyClient: PromiseClient<typeof CustodyService> | undefined;
  let stakingClient: PromiseClient<typeof StakingService> | undefined;

  return connectChannelAdapter({
    jsonOptions,

    /** @see https://connectrpc.com/docs/node/implementing-services */
    routes: (router: ConnectRouter) =>
      rpcImpls.map(([serviceType, serviceImpl]) => router.service(serviceType, serviceImpl)),

    // context so impls can access storage, ui, other services, etc
    createRequestContext: req => {
      const contextValues = req.contextValues ?? createContextValues();

      // initialize or reuse context clients
      custodyClient ??= createDirectClient(CustodyService, handler, { jsonOptions });
      stakingClient ??= createDirectClient(StakingService, handler, { jsonOptions });
      contextValues.set(custodyClientCtx, custodyClient);
      contextValues.set(stakingClientCtx, stakingClient);

      // remaining context for all services
      contextValues.set(fvkCtx, getFullViewingKey);
      contextValues.set(servicesCtx, () => services);

      // additional context for custody service only
      const { pathname } = new URL(req.url);
      if (pathname.startsWith('/penumbra.custody.v1.Custody')) {
        contextValues.set(skCtx, getSpendKey);
        contextValues.set(approverCtx, approveTransaction);
      }

      return Promise.resolve({ ...req, contextValues });
    },
  });
};

await fixEmptyGrpcEndpointAfterOnboarding();

const handler = await getServiceHandler();
CRSessionManager.init(PRAX, handler);
