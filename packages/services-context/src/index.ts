import { BlockProcessor } from '@penumbra-zone/query/block-processor';
import { RootQuerier } from '@penumbra-zone/query/root-querier';
import { IndexedDb } from '@penumbra-zone/storage/indexed-db';
import { syncLastBlockWithLocal } from '@penumbra-zone/storage/chrome/syncer';
import { ViewServer } from '@penumbra-zone/wasm/view-server';
import { ServicesMessage } from '@penumbra-zone/types/services';
import type { JsonValue } from '@bufbuild/protobuf';
import {
  FullViewingKey,
  WalletId,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { ViewServerInterface } from '@penumbra-zone/types/servers';
import { BlockProcessorInterface } from '@penumbra-zone/types/block-processor';
import { IndexedDbInterface } from '@penumbra-zone/types/indexed-db';
import { RootQuerierInterface } from '@penumbra-zone/types/querier';

export interface WalletServices {
  viewServer: ViewServerInterface;
  blockProcessor: BlockProcessorInterface;
  indexedDb: IndexedDbInterface;
  querier: RootQuerierInterface;
}

export interface ServicesConfig {
  readonly idbVersion: number;
  readonly grpcEndpoint: string;
  readonly walletId: WalletId;
  readonly fullViewingKey: FullViewingKey;
}

export class Services {
  private walletServicesPromise: Promise<WalletServices> | undefined;

  constructor(private config: ServicesConfig) {
    // Attach a listener to allow extension documents to control services.
    // Note that you can't activate this handler from another part of the background script.
    chrome.runtime.onMessage.addListener((req: JsonValue, sender, respond: () => void) => {
      const emptyResponse = () => respond();
      if (sender.origin !== origin || typeof req !== 'string') return false;
      switch (req in ServicesMessage && (req as ServicesMessage)) {
        case false:
          return false;
        case ServicesMessage.ClearCache:
          void this.clearCache().then(emptyResponse);
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
    const { grpcEndpoint } = this.config;
    this._querier = new RootQuerier({ grpcEndpoint });

    // initialize walletServices separately without exponential backoff to bubble up errors immediately
    await this.getWalletServices();
  }

  // If getWalletServices() is called multiple times concurrently,
  // they'll all wait for the same promise rather than each starting their own initialization process.
  public async getWalletServices(): Promise<WalletServices> {
    if (!this.walletServicesPromise) {
      this.walletServicesPromise = this.initializeWalletServices().catch((e: unknown) => {
        // If promise rejected, reset promise to `undefined` so next caller can try again
        this.walletServicesPromise = undefined;
        throw e;
      });
    }
    void this.walletServicesPromise.then(({ blockProcessor }) => blockProcessor.sync());
    return this.walletServicesPromise;
  }

  private async initializeWalletServices(): Promise<WalletServices> {
    const { walletId, fullViewingKey, idbVersion: dbVersion } = this.config;
    const params = await this.querier.app.appParams();
    if (!params.sctParams?.epochDuration) throw new Error('Epoch duration unknown');
    const {
      chainId,
      sctParams: { epochDuration },
    } = params;

    const registryClient = new ChainRegistryClient();

    const indexedDb = await IndexedDb.initialize({
      chainId,
      dbVersion,
      walletId,
      registryClient,
    });

    void syncLastBlockWithLocal(indexedDb);

    const viewServer = await ViewServer.initialize({
      fullViewingKey,
      epochDuration,
      getStoredTree: () => indexedDb.getStateCommitmentTree(),
      idbConstants: indexedDb.constants(),
    });

    const registry = registryClient.get(chainId);
    const blockProcessor = new BlockProcessor({
      viewServer,
      querier: this.querier,
      indexedDb,
      stakingTokenMetadata: registry.getMetadata(registry.stakingAssetId),
      numeraires: registry.numeraires.map(numeraires => registry.getMetadata(numeraires)),
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
