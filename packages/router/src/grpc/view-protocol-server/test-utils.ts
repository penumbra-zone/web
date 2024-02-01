import { Mock } from 'vitest';

export interface IndexedDbMock {
  getSpendableNoteByNullifier?: Mock;
  getSwapByNullifier?: Mock;
  subscribe?: (table: string) => Partial<AsyncIterable<Mock>>;
}
export interface TendermintMock {
  broadcastTx?: Mock;
}
export interface MockServices {
  getWalletServices: Mock<[], Promise<{ indexedDb: IndexedDbMock }>>;
  querier?: {
    tendermint: TendermintMock;
  };
}
