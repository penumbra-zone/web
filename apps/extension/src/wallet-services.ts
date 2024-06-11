import { Services } from '@penumbra-zone/services-context';
import { backOff } from 'exponential-backoff';
import {
  FullViewingKey,
  WalletId,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { onboardGrpcEndpoint, onboardWallet } from './storage/onboard';
import { ServicesMessage } from './message/services';
import { localExtStorage } from './storage/local';
import { AppParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/app/v1/app_pb';
import { AppService } from '@penumbra-zone/protobuf';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { createPromiseClient } from '@connectrpc/connect';

export const startWalletServices = () =>
  backOff(
    async () => {
      const wallet = await onboardWallet();
      const grpcEndpoint = await onboardGrpcEndpoint();

      const chainId =
        (await localExtStorage
          .get('params')
          .then(json => json && AppParameters.fromJson(json).chainId)) ??
        (await createPromiseClient(AppService, createGrpcWebTransport({ baseUrl: grpcEndpoint }))
          .appParameters({})
          .then(({ appParameters }) => appParameters?.chainId));

      if (!chainId) throw new Error('No chainId available');

      const services = new Services({
        chainId,
        idbVersion: IDB_VERSION,
        grpcEndpoint,
        walletId: WalletId.fromJsonString(wallet.id),
        fullViewingKey: FullViewingKey.fromJsonString(wallet.fullViewingKey),
      });

      const { blockProcessor, indexedDb } = await services.getWalletServices();

      // sync the IndexedDb last block number with chrome.storage.local
      // Later used in Zustand store
      void (async () => {
        const fullSyncHeightDb = await indexedDb.getFullSyncHeight();
        await localExtStorage.set('fullSyncHeight', Number(fullSyncHeightDb));

        const subscription = indexedDb.subscribe('FULL_SYNC_HEIGHT');
        for await (const update of subscription) {
          await localExtStorage.set('fullSyncHeight', Number(update.value));
        }
      })();

      // attach a listener to allow extension documents to control services.
      chrome.runtime.onMessage.addListener((req: unknown, sender, respond: () => void) => {
        if (sender.origin !== origin || typeof req !== 'string') return false;
        switch (req in ServicesMessage && (req as ServicesMessage)) {
          case false:
            return false;
          case ServicesMessage.ClearCache:
            void (async () => {
              blockProcessor.stop('clearCache');
              await Promise.allSettled([localExtStorage.remove('params'), indexedDb.clear()]);
            })().finally(() => {
              respond();
              chrome.runtime.reload();
            });
            return true;
        }
      });

      return services;
    },
    {
      delayFirstAttempt: false,
      startingDelay: 5_000, // 5 seconds
      numOfAttempts: Infinity,
      maxDelay: 20_000, // 20 seconds
      retry: (e, attemptNumber) => {
        console.log("Prax couldn't start wallet services", attemptNumber, e);
        return true;
      },
    },
  );
