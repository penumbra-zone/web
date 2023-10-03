import { testnetConstants } from 'penumbra-constants';
import { swMessageHandler } from '../routes/service-worker/root-router';
import { RootQuerier } from 'penumbra-query/src/root-querier';
import { IndexedDb, localExtStorage, syncLastBlockWithLocal } from 'penumbra-storage';
import { ViewServer } from 'penumbra-wasm-ts';
import { BlockProcessor } from 'penumbra-query';

const sw = self as unknown as ServiceWorkerGlobalScope & typeof globalThis;

interface WalletServices {
  viewServer: ViewServer;
  blockProcessor: BlockProcessor;
}

export class Services {
  private walletServicesPromise: Promise<WalletServices> | undefined;

  private _querier: RootQuerier | undefined;

  get querier(): RootQuerier {
    if (!this._querier) throw new Error('Services have not been initialized');
    return this._querier;
  }

  private _indexedDb: IndexedDb | undefined;

  get indexedDb(): IndexedDb {
    if (!this._indexedDb) throw new Error('Services have not been initialized');
    return this._indexedDb;
  }

  async onServiceWorkerInit(): Promise<void> {
    try {
      // Forces the waiting service worker to become the active service worker
      await sw.skipWaiting();
      await sw.clients.claim();

      const grpcEndpoint = await localExtStorage.get('grpcEndpoint');
      this._querier = new RootQuerier({ grpcEndpoint });

      const { chainId } = await this.querier.app.chainParameters();
      this._indexedDb = await IndexedDb.initialize({
        chainId,
        dbVersion: testnetConstants.indexedDbVersion,
        updateNotifiers: [syncLastBlockWithLocal()],
      });

      await this.tryToSync();

      // Now ready to handle messages
      chrome.runtime.onMessage.addListener(swMessageHandler);
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
      const { epochDuration } = await this.querier.app.chainParameters();

      const viewServer = await ViewServer.initialize({
        fullViewingKey: wallets[0]!.fullViewingKey,
        epochDuration,
        getStoredTree: () => this.indexedDb.getStateCommitmentTree(),
      });

      const blockProcessor = new BlockProcessor({
        viewServer,
        querier: this.querier,
        indexedDb: this.indexedDb,
      });

      return { viewServer, blockProcessor };
    } else {
      throw new Error('No wallets for view server to initialize for');
    }
  }
}
