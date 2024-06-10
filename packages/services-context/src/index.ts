import { BlockProcessor } from '@penumbra-zone/query/block-processor';
import { RootQuerier } from '@penumbra-zone/query/root-querier';
import { IndexedDb } from '@penumbra-zone/storage/indexed-db';
import { localExtStorage } from '@penumbra-zone/storage/chrome/local';
import { ViewServer } from '@penumbra-zone/wasm/view-server';
import { ServicesInterface, WalletServices } from '@penumbra-zone/types/services';
import {
  FullViewingKey,
  WalletId,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { AppParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/app/v1/app_pb';
import { Jsonified } from '@penumbra-zone/types/jsonified';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

export interface ServicesConfig {
  readonly idbVersion: number;
  readonly grpcEndpoint: string;
  readonly walletId: WalletId;
  readonly fullViewingKey: FullViewingKey;
  readonly numeraireAssetId: AssetId;
}

export class Services implements ServicesInterface {
  private walletServicesPromise: Promise<WalletServices> | undefined;

  constructor(private config: ServicesConfig) {}

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

  /**
   * Attempt to fetch the AppParameters from the remote fullnode, or fall back
   * to the local storage. Will throw to abort if the remote node reports an
   * unexpected chainId.
   *
   * @returns completed AppParameters from remote or storage
   */
  private async getParams(querier: RootQuerier): Promise<AppParameters> {
    // try to read params from storage
    const storedParams = await localExtStorage
      .get('params')
      .then(j => j && AppParameters.fromJson(j))
      .catch(() => undefined);
    // try to fetch params from network
    const queriedParams = await querier.app.appParams().catch(() => undefined);

    // verify params by chainId
    if (
      storedParams?.chainId &&
      queriedParams?.chainId &&
      storedParams.chainId !== queriedParams.chainId
    ) {
      // fail mismatch
      const badChainIdMsg =
        'Local chainId does not match the remote chainId. Your local state may\
        be invalid, or you may be connecting to the wrong chain. You cannot use\
        this RPC endpoint without clearing your local chain state.';
      // log flamboyantly
      console.error(`%c${badChainIdMsg}`, 'font-weight: bold; font-size: 2em;', {
        storedParams,
        queriedParams,
      });
      throw new Error(badChainIdMsg);
    } else if (queriedParams?.chainId) {
      // fetched params exist and are ok. store and return
      await localExtStorage.set('params', queriedParams.toJson() as Jsonified<AppParameters>);
      return queriedParams;
    } else if (storedParams?.chainId) {
      // none fetched, use stored
      return storedParams;
    } else throw new Error('No available chainId');
  }

  private async initializeWalletServices(): Promise<WalletServices> {
    const { grpcEndpoint, walletId, fullViewingKey, idbVersion, numeraireAssetId } = this.config;
    const querier = new RootQuerier({ grpcEndpoint });
    const params = await this.getParams(querier);
    const registryClient = new ChainRegistryClient();
    const indexedDb = await IndexedDb.initialize({
      chainId: params.chainId,
      idbVersion,
      walletId,
      registryClient,
    });

    void this.syncLastBlockWithLocal(indexedDb);

    if (!params.sctParams?.epochDuration)
      throw new Error('Cannot initialize viewServer without epoch duration');

    const viewServer = await ViewServer.initialize({
      fullViewingKey,
      epochDuration: params.sctParams.epochDuration,
      getStoredTree: () => indexedDb.getStateCommitmentTree(),
      idbConstants: indexedDb.constants(),
    });

    const registry = registryClient.get(params.chainId);
    const blockProcessor = new BlockProcessor({
      viewServer,
      querier,
      indexedDb,
      stakingTokenMetadata: registry.getMetadata(registry.stakingAssetId),
      numeraire: registry.getMetadata(numeraireAssetId),
    });

    return { viewServer, blockProcessor, indexedDb, querier };
  }

  public async clearCache() {
    const ws = await this.getWalletServices();

    ws.blockProcessor.stop('clearCache');
    await ws.indexedDb.clear();
    this.walletServicesPromise = undefined;
    void this.getWalletServices();
  }

  // Syncs the IndexedDb last block number with chrome.storage.local
  // Later used to synchronize with Zustand store
  private syncLastBlockWithLocal = async (indexedDb: IndexedDb) => {
    const fullSyncHeightDb = await indexedDb.getFullSyncHeight();
    await localExtStorage.set('fullSyncHeight', Number(fullSyncHeightDb));

    const subscription = indexedDb.subscribe('FULL_SYNC_HEIGHT');
    for await (const update of subscription) {
      await localExtStorage.set('fullSyncHeight', Number(update.value));
    }
  };
}
