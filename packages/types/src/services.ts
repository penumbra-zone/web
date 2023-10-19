import { IndexedDbInterface } from './indexed-db';
import { ViewServerInterface } from './servers';
import { BlockProcessorInterface } from './block-processor';
import { RootQuerierInterface } from './querier';

export interface WalletServices {
  viewServer: ViewServerInterface;
  blockProcessor: BlockProcessorInterface;
  indexedDb: IndexedDbInterface;
}

export interface ServicesInterface {
  readonly querier: RootQuerierInterface;
  initialize(): Promise<void>;
  tryToSync(): Promise<void>;
  getWalletServices(): Promise<WalletServices>;
  initializeWalletServices(): Promise<WalletServices>;
  clearCache(): Promise<void>;
}
