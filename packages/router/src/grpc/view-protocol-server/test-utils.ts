import { Mock } from 'vitest';

export interface IndexedDbMock {
  getSpendableNoteByNullifier?: Mock;
  getSwapByNullifier?: Mock;
  getAppParams?: Mock;
  getFmdParams?: Mock;
  getLastBlockSynced?: Mock;
  iterateTransactionInfo?: () => Partial<AsyncIterable<Mock>>;
  iterateSpendableNotes?: () => Partial<AsyncIterable<Mock>>;
  subscribe?: (table: string) => Partial<AsyncIterable<Mock>>;
}
export interface TendermintMock {
  broadcastTx?: Mock;
  latestBlockHeight?: Mock;
}
export interface MockServices {
  getWalletServices: Mock<[], Promise<{ indexedDb: IndexedDbMock }>>;
  querier?: {
    tendermint: TendermintMock;
  };
}
