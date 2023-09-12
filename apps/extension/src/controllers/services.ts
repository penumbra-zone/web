import { Controllers } from './initialize';
import { localExtStorage } from '../storage/local';
import { initializeControllers } from '../routes/service-worker/handlers/initialize';
import { testnetConstants } from 'penumbra-constants';

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
    const wallets = await localExtStorage.get('wallets');
    if (wallets.length) {
      await initializeControllers({
        grpcEndpoint: testnetConstants.grpcEndpoint,
        indexedDbVersion: testnetConstants.indexedDbVersion,
        fullViewingKey: wallets[0]!.fullViewingKey,
      });
    }
  }
}
