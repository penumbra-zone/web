import { BlockProcessor, RootQuerier } from '@penumbra-zone/query';
import { IndexedDb, syncLastBlockWithLocal } from '@penumbra-zone/storage';
import { ViewServer } from '@penumbra-zone/wasm';
import {
  ServicesInterface,
  ServicesMessage,
  WalletServices,
} from '@penumbra-zone/types/src/services';
import type { JsonValue } from '@bufbuild/protobuf';

export interface ServicesConfig {
  grpcEndpoint: string;
  idbVersion: number;
  getWallet(): Promise<{ walletId: string; fullViewingKey: string }>;
}

export class Services implements ServicesInterface {
  private walletServicesPromise: Promise<WalletServices> | undefined;

  constructor(private readonly config: ServicesConfig) {
    // Attach a listener to allow extension documents to control services.
    // Note that you can't activate this handler from another part of the background script.
    chrome.runtime.onMessage.addListener((req: JsonValue, sender, respond) => {
      if (sender.origin !== origin || typeof req !== 'string') return false;
      switch (req in ServicesMessage && (req as ServicesMessage)) {
        case false:
          return false;
        case ServicesMessage.ClearCache:
          void this.clearCache().then(() => respond());
          return true;
      }
    });
  }

  private _querier: RootQuerier | undefined;

  get querier(): RootQuerier {
    if (!this._querier) throw new Error('Services have not been initialized');
    return this._querier;
  }

  public async initialize(): Promise<void> {
    this._querier = new RootQuerier({ grpcEndpoint: this.config.grpcEndpoint });

    // initialize walletServices separately without exponential backoff to bubble up errors immediately
    await this.getWalletServices();
  }

  // If getWalletServices() is called multiple times concurrently,
  // they'll all wait for the same promise rather than each starting their own initialization process.
  public async getWalletServices(): Promise<WalletServices> {
    if (!this.walletServicesPromise) {
      this.walletServicesPromise = this.initializeWalletServices().catch(e => {
        // If promise rejected, reset promise to `undefined` so next caller can try again
        this.walletServicesPromise = undefined;
        throw e;
      });
    }
    void this.walletServicesPromise.then(({ blockProcessor }) => blockProcessor.sync());
    return this.walletServicesPromise;
  }

  private async initializeWalletServices(): Promise<WalletServices> {
    const { walletId, fullViewingKey } = await this.config.getWallet();
    const params = await this.querier.app.appParams();
    if (!params.sctParams?.epochDuration) throw new Error('Epoch duration unknown');
    const {
      chainId,
      sctParams: { epochDuration },
    } = params;

    const indexedDb = await IndexedDb.initialize({
      chainId,
      dbVersion: this.config.idbVersion,
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
      viewServer,
      querier: this.querier,
      indexedDb,
    });

    return { viewServer, blockProcessor, indexedDb, querier: this.querier };
  }

  private async clearCache() {
    const ws = await this.getWalletServices();

    ws.blockProcessor.stop('clearCache');
    await ws.indexedDb.clear();
    this.walletServicesPromise = undefined;
    await this.initialize();
  }
}
