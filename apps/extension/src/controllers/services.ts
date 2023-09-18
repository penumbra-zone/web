import { Controllers } from './initialize';
import { localExtStorage } from '../storage/local';
import { initializeControllers } from '../routes/service-worker/handlers/initialize';
import { testnetConstants } from 'penumbra-constants';
import { swMessageHandler } from '../routes/service-worker/message-handler';

const sw = self as unknown as ServiceWorkerGlobalScope & typeof globalThis;

export class Services {
  private _controllers: Controllers | undefined;

  get controllers(): Controllers {
    if (!this._controllers) {
      throw new Error('Services have not been initialized');
    }
    return this._controllers;
  }

  setControllers(controllers: Controllers) {
    this._controllers = controllers;
  }

  async onServiceWorkerInit() {
    chrome.runtime.onMessage.addListener(swMessageHandler);

    // Forces the waiting service worker to become the active service worker
    await sw.skipWaiting();
    await sw.clients.claim();

    const wallets = await localExtStorage.get('wallets');
    if (wallets.length) {
      const grpcEndpoint = await localExtStorage.get('grpcEndpoint');

      await initializeControllers({
        grpcEndpoint,
        indexedDbVersion: testnetConstants.indexedDbVersion,
        fullViewingKey: wallets[0]!.fullViewingKey,
      });
    }
  }
}
