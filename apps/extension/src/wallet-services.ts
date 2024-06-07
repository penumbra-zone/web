import { Services } from '@penumbra-zone/services-context';
import { backOff } from 'exponential-backoff';
import {
  FullViewingKey,
  WalletId,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { onboardGrpcEndpoint, onboardWallet } from './storage/onboard';
import { ServicesMessage } from './message/services';

export const startWalletServices = () =>
  backOff(
    async () => {
      const wallet = await onboardWallet();
      const grpcEndpoint = await onboardGrpcEndpoint();
      const services = new Services({
        idbVersion: IDB_VERSION,
        grpcEndpoint,
        walletId: WalletId.fromJsonString(wallet.id),
        fullViewingKey: FullViewingKey.fromJsonString(wallet.fullViewingKey),
      });

      // initialize
      await services.getWalletServices();

      // attach a listener to allow extension documents to control services.
      chrome.runtime.onMessage.addListener((req: unknown, sender, respond: () => void) => {
        if (sender.origin !== origin || typeof req !== 'string') return false;
        switch (req in ServicesMessage && (req as ServicesMessage)) {
          case false:
            return false;
          case ServicesMessage.ClearCache:
            void services.clearCache().finally(() => respond());
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
