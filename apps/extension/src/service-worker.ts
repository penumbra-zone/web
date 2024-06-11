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

// all rpc implementations, local and proxy
import { getRpcImpls } from './rpc';

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
import { getWalletId } from './ctx/wallet-id';
import { getSpendKey } from './ctx/spend-key';

// context clients
import { StakeService, CustodyService } from '@penumbra-zone/protobuf';
import { custodyClientCtx } from '@penumbra-zone/services/ctx/custody-client';
import { stakeClientCtx } from '@penumbra-zone/services/ctx/stake-client';
import { createDirectClient } from '@penumbra-zone/transport-dom/direct';

// idb, querier, block processor
import { startWalletServices } from './wallet-services';
import { walletIdCtx } from '@penumbra-zone/services/ctx/wallet-id';

import { backOff } from 'exponential-backoff';

const initHandler = async () => {
  const walletServices = startWalletServices();
  const rpcImpls = await getRpcImpls();

  let custodyClient: PromiseClient<typeof CustodyService> | undefined;
  let stakeClient: PromiseClient<typeof StakeService> | undefined;

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
      stakeClient ??= createDirectClient(StakeService, handler, { jsonOptions });
      contextValues.set(custodyClientCtx, custodyClient);
      contextValues.set(stakeClientCtx, stakeClient);

      // remaining context for all services
      contextValues.set(fvkCtx, getFullViewingKey);
      contextValues.set(servicesCtx, () => walletServices);
      contextValues.set(walletIdCtx, getWalletId);

      // discriminate context available to specific services
      const { pathname } = new URL(req.url);
      if (pathname.startsWith('/penumbra.custody.v1.Custody')) {
        contextValues.set(skCtx, getSpendKey);
        contextValues.set(approverCtx, approveTransaction);
      }

      return Promise.resolve({ ...req, contextValues });
    },
  });
};

const handler = await backOff(() => initHandler(), {
  delayFirstAttempt: false,
  startingDelay: 5_000, // 5 seconds
  numOfAttempts: Infinity,
  maxDelay: 20_000, // 20 seconds
  retry: (e, attemptNumber) => {
    console.log("Prax couldn't start wallet services", attemptNumber, e);
    return true;
  },
});

CRSessionManager.init(PRAX, handler);
