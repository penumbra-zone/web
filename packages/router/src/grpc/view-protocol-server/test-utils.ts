import { Mock } from 'vitest';

export interface IndexedDbMock {
  constants?: Mock;
  getAppParams?: Mock;
  getAssetsMetadata?: Mock;
  getGasPrices?: Mock;
  getFmdParams?: Mock;
  getLastBlockSynced?: Mock;
  getSpendableNoteByCommitment?: Mock;
  getSpendableNoteByNullifier?: Mock;
  getStateCommitmentTree?: Mock;
  getSwapByNullifier?: Mock;
  getTransactionInfo?: Mock;
  iterateTransactionInfo?: () => Partial<AsyncIterable<Mock>>;
  iterateSpendableNotes?: () => Partial<AsyncIterable<Mock>>;
  iterateAssetsMetadata?: () => Partial<AsyncIterable<Mock>>;
  subscribe?: (table: string) => Partial<AsyncIterable<Mock>>;
  getSwapByCommitment?: Mock;
}
export interface TendermintMock {
  broadcastTx?: Mock;
  getTransaction?: Mock;
  latestBlockHeight?: Mock;
}

export interface ShieldedPoolMock {
  assetMetadata: Mock;
}

export interface ViewServerMock {
  fullViewingKey?: Mock;
}
export interface MockServices {
  getWalletServices: Mock<[], Promise<{ indexedDb?: IndexedDbMock; viewServer?: ViewServerMock }>>;
  querier?: {
    tendermint?: TendermintMock;
    shieldedPool?: ShieldedPoolMock;
  };
}
