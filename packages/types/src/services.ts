import { IndexedDbInterface } from './indexed-db';
import { ViewServerInterface } from './servers';
import { BlockProcessorInterface } from './block-processor';
import { RootQuerierInterface } from './querier';

export interface WalletServices {
  viewServer: ViewServerInterface;
  blockProcessor: BlockProcessorInterface;
  indexedDb: IndexedDbInterface;
  querier: RootQuerierInterface;
}

export interface ServicesInterface {
  readonly querier: RootQuerierInterface;
  initialize(): Promise<void>;
  getWalletServices(): Promise<WalletServices>;
}

export enum ServicesMessage {
  OnboardComplete = 'OnboardComplete',
  ClearCache = 'ClearCache',
  TimeChain = 'TimeChain',
}
