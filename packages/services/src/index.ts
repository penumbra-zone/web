import { testnetConstants } from '@penumbra-zone/constants';
import { BlockProcessor, RootQuerier } from '@penumbra-zone/query';
import { IndexedDb, syncLastBlockWithLocal } from '@penumbra-zone/storage';
import { ViewServer } from '@penumbra-zone/wasm-ts';
import { ServicesInterface, WalletServices } from '@penumbra-zone/types/src/services';

export interface ServicesConfig {
  grpcEndpoint: string;
  getWallet(): Promise<{ walletId: string; fullViewingKey: string }>;
}

export class Services implements ServicesInterface {
  private walletServicesPromise: Promise<WalletServices> | undefined;

  constructor(private readonly config: ServicesConfig) {}

  private _querier: RootQuerier | undefined;

  get querier(): RootQuerier {
    if (!this._querier) throw new Error('Services have not been initialized');
    return this._querier;
  }

  async initialize(): Promise<void> {
    try {
      this._querier = new RootQuerier({ grpcEndpoint: this.config.grpcEndpoint });

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
    const { walletId, fullViewingKey } = await this.config.getWallet();
    const { chainId, epochDuration } = await this.querier.app.chainParams();

    const indexedDb = await IndexedDb.initialize({
      chainId,
      dbVersion: testnetConstants.indexedDbVersion,
      walletId,
    });

    void syncLastBlockWithLocal(indexedDb);

    const viewServer = await ViewServer.initialize({
      fullViewingKey,
      epochDuration,
      getStoredTree: () => indexedDb.getStateCommitmentTree(),
      idbConstants: indexedDb.constants(),
    });

    const blockProcessor = new BlockProcessor({
      fullViewingKey,
      viewServer,
      querier: this.querier,
      indexedDb,
    });

    return { viewServer, blockProcessor, indexedDb };
  }

  async clearCache() {
    const ws = await this.getWalletServices();

    ws.blockProcessor.stopSync();
    await ws.indexedDb.clear();
    this.walletServicesPromise = undefined;
    await this.initialize();
  }
}
