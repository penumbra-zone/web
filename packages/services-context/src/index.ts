import { BlockProcessor } from '@penumbra-zone/query/block-processor';
import { RootQuerier } from '@penumbra-zone/query/root-querier';
import { IndexedDb } from '@penumbra-zone/storage/indexed-db';
import { ViewServer } from '@penumbra-zone/wasm/view-server';
import { ServicesInterface, WalletServices } from '@penumbra-zone/types/services';
import {
  FullViewingKey,
  WalletId,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { ChainRegistryClient } from '@penumbra-labs/registry';
import { AppParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/app/v1/app_pb';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

export interface ServicesConfig {
  readonly chainId: string;
  readonly idbVersion: number;
  readonly grpcEndpoint: string;
  readonly walletId: WalletId;
  readonly fullViewingKey: FullViewingKey;
  readonly numeraires: AssetId[];
}

export class Services implements ServicesInterface {
  private walletServicesPromise: Promise<WalletServices> | undefined;

  constructor(private config: ServicesConfig) {}

  // If getWalletServices() is called multiple times concurrently, they'll all
  // wait for the same promise rather than each starting their own
  // initialization process.
  public async getWalletServices(): Promise<WalletServices> {
    if (!this.walletServicesPromise) {
      this.walletServicesPromise = this.initializeWalletServices().catch((e: unknown) => {
        // If promise rejected, reset promise to `undefined` so next caller can
        // try again
        this.walletServicesPromise = undefined;
        throw e;
      });
    }
    void this.walletServicesPromise.then(({ blockProcessor }) => blockProcessor.sync());
    return this.walletServicesPromise;
  }

  /**
   * Attempt to fetch parameters from the remote fullnode, or fall back to known
   * parameters in indexedDb.
   *
   * Will throw to abort if the remote node reports an unexpected chainId.
   *
   * @returns `AppParameters`
   */
  private async getParams(indexedDb: IndexedDb, querier: RootQuerier): Promise<AppParameters> {
    // try to read params from idb
    const storedParams = await indexedDb.getAppParams();

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
    } else if (storedParams?.chainId) {
      // stored params exist and are ok.  if there were updates, the block
      // processor will handle those at the appropriate time.
      return storedParams;
    } else if (queriedParams?.chainId) {
      // none stored, but fetched are ok.
      return queriedParams;
    } else throw new Error('No available chainId');
  }

  private async initializeWalletServices(): Promise<WalletServices> {
    const { chainId, grpcEndpoint, walletId, fullViewingKey, idbVersion, numeraires } = this.config;
    const querier = new RootQuerier({ grpcEndpoint });
    const registryClient = new ChainRegistryClient();
    const indexedDb = await IndexedDb.initialize({
      chainId,
      idbVersion,
      walletId,
      registryClient,
    });

    const { sctParams } = await this.getParams(indexedDb, querier);
    if (!sctParams?.epochDuration)
      throw new Error('Cannot initialize viewServer without epoch duration');

    const viewServer = await ViewServer.initialize({
      fullViewingKey,
      epochDuration: sctParams.epochDuration,
      getStoredTree: () => indexedDb.getStateCommitmentTree(),
      idbConstants: indexedDb.constants(),
    });

    const registry = registryClient.get(chainId);
    const blockProcessor = new BlockProcessor({
      viewServer,
      querier,
      indexedDb,
      stakingTokenMetadata: registry.getMetadata(registry.stakingAssetId),
      numeraires: numeraires.map(registry.getMetadata),
    });

    return { viewServer, blockProcessor, indexedDb, querier };
  }
}
