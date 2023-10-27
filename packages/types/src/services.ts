import { BlockProcessorInterface } from './block-processor';
import { IndexedDbInterface } from './indexed-db';
import { NotificationPath } from './notifications';
import { RootQuerierInterface } from './querier';
import { ViewServerInterface } from './servers';

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
  openWindow(path: NotificationPath, search?: string): Promise<void>;
}
