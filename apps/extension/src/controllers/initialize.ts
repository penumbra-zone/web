import { IndexedDb } from 'penumbra-indexed-db';
import { ViewServer } from 'penumbra-wasm-ts';
import { BlockProcessor } from 'penumbra-query';
import { RootQuerier } from 'penumbra-query/src/root-querier';

export interface ControllersProps {
  fullViewingKey: string;
  grpcEndpoint: string;
  indexedDbVersion: number;
}

export class Controllers {
  private constructor(
    readonly querier: RootQuerier,
    readonly indexedDb: IndexedDb,
    readonly viewServer: ViewServer,
    readonly blockProcessor: BlockProcessor,
  ) {}

  static async initialize({
    grpcEndpoint,
    indexedDbVersion,
    fullViewingKey,
  }: ControllersProps): Promise<Controllers> {
    const querier = new RootQuerier({ grpcEndpoint });

    const { chainId, epochDuration } = await querier.viewService.chainParameters();
    const indexedDb = await IndexedDb.initialize({
      chainId,
      dbVersion: indexedDbVersion,
    });

    const viewServer = await ViewServer.initialize({
      fullViewingKey,
      epochDuration,
      getStoredTree: () => indexedDb.getStateCommitmentTree(),
    });

    const blockProcessor = new BlockProcessor({
      viewServer,
      querier,
      indexedDb,
    });
    return new this(querier, indexedDb, viewServer, blockProcessor);
  }
}
