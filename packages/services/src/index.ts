import { testnetConstants } from '@penumbra-zone/constants';
import { BlockProcessor, RootQuerier } from '@penumbra-zone/query';
import { IndexedDb, localExtStorage, syncLastBlockWithLocal } from '@penumbra-zone/storage';
import { NotificationPath } from '@penumbra-zone/types';
import { ServicesInterface, WalletServices } from '@penumbra-zone/types/src/services';
import { ViewServer } from '@penumbra-zone/wasm-ts';

export class Services implements ServicesInterface {
  private walletServicesPromise: Promise<WalletServices> | undefined;

  private _querier: RootQuerier | undefined;

  get querier(): RootQuerier {
    if (!this._querier) throw new Error('Services have not been initialized');
    return this._querier;
  }

  async initialize(): Promise<void> {
    try {
      const grpcEndpoint = await localExtStorage.get('grpcEndpoint');

      this._querier = new RootQuerier({ grpcEndpoint });

      await this.tryToSync();
    } catch (e) {
      // Logging here as service worker does not appear to bubble the errors up
      console.error(e);
      throw e;
    }
  }

  async tryToSync() {
    try {
      const ws = await this.getWalletServices();
      void ws.blockProcessor.syncBlocks();
    } catch {
      // With throw if no wallet. Can ignore.
    }
  }

  // If getWalletServices() is called multiple times concurrently,
  // they'll all wait for the same promise rather than each starting their own initialization process.
  async getWalletServices(): Promise<WalletServices> {
    if (!this.walletServicesPromise) {
      this.walletServicesPromise = this.initializeWalletServices().catch(e => {
        // If promise rejected, reset promise to `undefined` so next caller can try again
        this.walletServicesPromise = undefined;
        throw e;
      });
    }
    return this.walletServicesPromise;
  }

  async initializeWalletServices(): Promise<WalletServices> {
    const wallets = await localExtStorage.get('wallets');
    if (wallets.length) {
      const { chainId, epochDuration } = await this.querier.app.chainParams();

      const indexedDb = await IndexedDb.initialize({
        chainId,
        dbVersion: testnetConstants.indexedDbVersion,
        walletId: wallets[0]!.id,
      });

      void syncLastBlockWithLocal(indexedDb);

      const viewServer = await ViewServer.initialize({
        fullViewingKey: wallets[0]!.fullViewingKey,
        epochDuration,
        getStoredTree: () => indexedDb.getStateCommitmentTree(),
        idbConstants: indexedDb.constants(),
      });

      const blockProcessor = new BlockProcessor({
        fullViewingKey: wallets[0]!.fullViewingKey,
        viewServer,
        querier: this.querier,
        indexedDb,
      });

      return { viewServer, blockProcessor, indexedDb };
    } else {
      throw new Error('No wallets for view server to initialize for');
    }
  }

  async clearCache() {
    const ws = await this.getWalletServices();

    ws.blockProcessor.stopSync();
    await ws.indexedDb.clear();
    await localExtStorage.set('lastBlockSynced', 0);
    this.walletServicesPromise = undefined;
    await this.initialize();
  }

  async openWindow(path: NotificationPath, search?: string) {
    const { top, left, width } = await chrome.windows.getLastFocused();

    await chrome.windows.create({
      url: `popup.html#${path}${search}`,
      type: 'popup',
      width: 400,
      height: 628,
      top,
      // press the window to the right side of screen
      left: left !== undefined && width !== undefined ? left + (width - 400) : 0,
    });
  }
}
