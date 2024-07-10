import { IndexedDbInterface } from './indexed-db.js';
import { ViewServerInterface } from './servers.js';
import { BlockProcessorInterface } from './block-processor.js';
import { RootQuerierInterface } from './querier.js';

export interface WalletServices {
  viewServer: ViewServerInterface;
  blockProcessor: BlockProcessorInterface;
  indexedDb: IndexedDbInterface;
  querier: RootQuerierInterface;
}

export interface ServicesInterface {
  getWalletServices(): Promise<WalletServices>;
}
