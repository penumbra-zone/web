import { Mock } from 'vitest';

export interface IndexedDbMock {
  getAppParams?: Mock;
  getFmdParams?: Mock;
  getLastBlockSynced?: Mock;
  getSpendableNoteByNullifier?: Mock;
  getSwapByNullifier?: Mock;
  getTransactionInfo?: Mock
  subscribe?: (table: string) => Partial<AsyncIterable<Mock>>;
}
export interface TendermintMock {
  broadcastTx?: Mock;
  getTransaction?: Mock;
  latestBlockHeight?: Mock;
}

export interface  ViewServerMock {
  fullViewingKey?: Mock;
}
export interface MockServices {
  getWalletServices: Mock<[], Promise<{ indexedDb?: IndexedDbMock,
    viewServer?: ViewServerMock}>>;
  querier?: {
    tendermint: TendermintMock;
  };
}

