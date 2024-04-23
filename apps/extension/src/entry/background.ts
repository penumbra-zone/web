import {
  FullViewingKey,
  WalletId,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { QueryService as StakingService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/stake/v1/stake_connect';
import { CustodyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1/custody_connect';
import { JsonValue } from '@bufbuild/protobuf';
import {
  Code,
  ConnectError,
  ConnectRouter,
  PromiseClient,
  createContextValues,
} from '@connectrpc/connect';
import { Services } from '@penumbra-zone/services-context';
import { approverCtx } from '@penumbra-zone/services/ctx/approver';
import { custodyCtx } from '@penumbra-zone/services/ctx/custody';
import { fvkCtx } from '@penumbra-zone/services/ctx/full-viewing-key';
import { servicesCtx } from '@penumbra-zone/services/ctx/prax';
import { stakingClientCtx } from '@penumbra-zone/services/ctx/staking-client';
import { localExtStorage } from '@penumbra-zone/storage/chrome/local';
import { CRSessionManager } from '@penumbra-zone/transport-chrome/session-manager';
import { connectChannelAdapter } from '@penumbra-zone/transport-dom/src/adapter';
import { createDirectClient } from '@penumbra-zone/transport-dom/src/direct';
import { transportOptions } from '@penumbra-zone/types/src/registry';
import { UserChoice } from '@penumbra-zone/types/src/user-choice';
import { WalletJson } from '@penumbra-zone/types/src/wallet';
import { backOff } from 'exponential-backoff';
import { approveOrigin, originAlreadyApproved } from '../approve-origin';
import { approveTransaction } from '../approve-transaction';
import { getRpcImpls } from '../get-rpc-impls';
import { PraxConnection } from '../message/prax';

export default defineBackground(() => {
  /**
   * This file is the entrypoint for the main and only background service worker.
   *
   * It is responsible for initializing:
   * - listeners for chrome runtime events
   * - Services, with endpoint config and a wallet
   * - rpc services, router, and adapter
   * - session manager for rpc entry
   */

  // trigger injected-connection-port to init when a known page is loaded.
  chrome.tabs.onUpdated.addListener(
    (tabId, { status, discarded }, { url }) =>
      void (async () => {
        if (
          status === 'complete' &&
          !discarded &&
          url?.startsWith('https://') &&
          (await originAlreadyApproved(url))
        )
          void chrome.tabs.sendMessage(tabId, PraxConnection.Init);
      })(),
  );

  // listen for page connection requests.
  // this is the only message we handle from an unapproved content script.
  chrome.runtime.onMessage.addListener(
    (req: PraxConnection.Request | JsonValue, sender, respond: (arg: PraxConnection) => void) => {
      if (req !== PraxConnection.Request) return false; // instruct chrome we will not respond

      void approveOrigin(sender).then(
        status => {
          // user made a choice
          if (status === UserChoice.Approved) {
            respond(PraxConnection.Init);
            void chrome.tabs.sendMessage(sender.tab!.id!, PraxConnection.Init);
          } else {
            respond(PraxConnection.Denied);
          }
        },
        e => {
          if (process.env['NODE_ENV'] === 'development') {
            console.warn('Connection request listener failed:', e);
          }
          if (e instanceof ConnectError && e.code === Code.Unauthenticated) {
            respond(PraxConnection.NeedsLogin);
          } else {
            respond(PraxConnection.Denied);
          }
        },
      );
      return true; // instruct chrome to wait for the response
    },
  );

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

  const startServices = async (wallet: WalletJson) => {
    const grpcEndpoint = await localExtStorage.get('grpcEndpoint');

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
    const wallet0 = (await localExtStorage.get('wallets'))[0];
    if (!wallet0) throw new Error('No wallet found');

    const services = await backOff(() => startServices(wallet0), {
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
        contextValues.set(fvkCtx, FullViewingKey.fromJsonString(wallet0.fullViewingKey));

        return Promise.resolve({ ...req, contextValues });
      },
    });
  };

  void (async () => {
    await waitUntilGrpcEndpointExists();
    const handler = await getServiceHandler();
    CRSessionManager.init(PRAX, handler);
  })();
});
