import { BlockProcessor } from '@penumbra-zone/query/src/block-processor';
import { RootQuerier } from '@penumbra-zone/query/src/root-querier';
import { IndexedDb } from '@penumbra-zone/storage/src/indexed-db';
import { localExtStorage } from '@penumbra-zone/storage/src/chrome/local';
import { syncLastBlockWithLocal } from '@penumbra-zone/storage/src/chrome/syncer';
import { ViewServer } from '@penumbra-zone/wasm/src/view-server';
import {
  ServicesInterface,
  ServicesMessage,
  WalletServices,
} from '@penumbra-zone/types/src/services';
import type { JsonValue } from '@bufbuild/protobuf';
import '@penumbra-zone/polyfills/src/Promise.withResolvers';
import {
  FullViewingKey,
  WalletId,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { Wallet } from '@penumbra-zone/types/src/wallet';

export interface ServicesConfig {
  readonly idbVersion: number;
  readonly grpcEndpoint?: string;
  readonly walletId?: WalletId;
  readonly fullViewingKey?: FullViewingKey;
  readonly numeraireAssetId: string;
}

const isCompleteServicesConfig = (c: Partial<ServicesConfig>): c is Required<ServicesConfig> =>
  c.grpcEndpoint != null &&
  c.idbVersion != null &&
  c.walletId != null &&
  c.fullViewingKey != null &&
  c.numeraireAssetId != null;

export class Services implements ServicesInterface {
  private walletServicesPromise: Promise<WalletServices> | undefined;
  private config: Promise<Required<ServicesConfig>>;

  constructor(initConfig: ServicesConfig) {
    const {
      promise: completeConfig,
      resolve: resolveConfig,
      reject: rejectConfig,
    } = Promise.withResolvers<Required<ServicesConfig>>();
    this.config = completeConfig;

    if (isCompleteServicesConfig(initConfig)) resolveConfig(initConfig);

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
        case ServicesMessage.OnboardComplete:
          void this.completeConfig(initConfig)
            .then(resolveConfig, rejectConfig)
            .then(emptyResponse);
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
    const { grpcEndpoint } = await this.config;
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
    const { walletId, fullViewingKey, idbVersion: dbVersion } = await this.config;
    const params = await this.querier.app.appParams();
    if (!params.sctParams?.epochDuration) throw new Error('Epoch duration unknown');
    const {
      chainId,
      sctParams: { epochDuration },
    } = params;

    const indexedDb = await IndexedDb.initialize({
      chainId,
      dbVersion,
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

  private async completeConfig(initConfig: ServicesConfig): Promise<Required<ServicesConfig>> {
    const grpcEndpoint = await localExtStorage.get('grpcEndpoint');
    const wallet0 = (await localExtStorage.get('wallets'))[0];
    if (!wallet0) throw Error('No wallets found');
    if (!grpcEndpoint) throw Error('No gRPC endpoint found');
    const { id: walletId, fullViewingKey } = Wallet.fromJson(wallet0);
    return {
      ...initConfig,
      grpcEndpoint,
      walletId: WalletId.fromJsonString(walletId),
      fullViewingKey: FullViewingKey.fromJsonString(fullViewingKey),
    };
  }

  private async clearCache() {
    const ws = await this.getWalletServices();

    ws.blockProcessor.stop('clearCache');
    await ws.indexedDb.clear();
    this.walletServicesPromise = undefined;
    await this.initialize();
  }
}
