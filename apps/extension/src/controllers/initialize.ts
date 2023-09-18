import { ObliviousQuerier } from 'penumbra-query/src/oblivious';
import { SpecificQuerier } from 'penumbra-query/src/specific';
import { IndexedDb } from 'penumbra-indexed-db';
import { ViewServer } from 'penumbra-wasm-ts';
import { BlockProcessor } from 'penumbra-query';

export interface ControllersProps {
  fullViewingKey: string;
  grpcEndpoint: string;
  indexedDbVersion: number;
}

export class Controllers {
  private constructor(
    readonly obliviousQuerier: ObliviousQuerier,
    readonly specificQuerier: SpecificQuerier,
    readonly indexedDb: IndexedDb,
    readonly viewServer: ViewServer,
    readonly blockProcessor: BlockProcessor,
  ) {}

  static async initialize({
    grpcEndpoint,
    indexedDbVersion,
    fullViewingKey,
  }: ControllersProps): Promise<Controllers> {
    const oblQuerier = new ObliviousQuerier({ grpcEndpoint });
    const specQuerier = new SpecificQuerier({ grpcEndpoint });

    const { chainId, epochDuration } = await oblQuerier.chainParameters();
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
      specQuerier,
      oblQuerier,
      indexedDb,
    });
    return new this(oblQuerier, specQuerier, indexedDb, viewServer, blockProcessor);
  }
}
