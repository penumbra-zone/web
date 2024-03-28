import { Mock } from 'vitest';
import { FullViewingKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { bech32ToFullViewingKey } from '@penumbra-zone/bech32/src/full-viewing-key';

export interface IndexedDbMock {
  constants?: Mock;
  getAppParams?: Mock;
  getAssetsMetadata?: Mock;
  getGasPrices?: Mock;
  getFmdParams?: Mock;
  getFullSyncHeight?: Mock;
  getNotesForVoting?: Mock;
  getOwnedPositionIds?: () => Partial<AsyncIterable<Mock>>;
  getSpendableNoteByCommitment?: Mock;
  getSpendableNoteByNullifier?: Mock;
  getStateCommitmentTree?: Mock;
  getSwapByNullifier?: Mock;
  getTransaction?: Mock;
  iterateAssetsMetadata?: () => Partial<AsyncIterable<Mock>>;
  iterateSpendableNotes?: () => Partial<AsyncIterable<Mock>>;
  iterateSwaps?: () => Partial<AsyncIterable<Mock>>;
  iterateTransactions?: () => Partial<AsyncIterable<Mock>>;
  iterateValidatorInfos?: () => Partial<AsyncIterable<Mock>>;
  subscribe?: (table: string) => Partial<AsyncIterable<Mock>>;
  getSwapByCommitment?: Mock;
  getEpochByHeight?: Mock;
  saveAssetsMetadata?: Mock;
  getPricesForAsset?: Mock;
}
export interface TendermintMock {
  broadcastTx?: Mock;
  getTransaction?: Mock;
  latestBlockHeight?: Mock;
}

export interface ShieldedPoolMock {
  assetMetadataById: Mock;
}

export interface ViewServerMock {
  fullViewingKey?: FullViewingKey;
}

interface MockQuerier {
  tendermint?: TendermintMock;
  shieldedPool?: ShieldedPoolMock;
  staking?: StakingMock;
}

export interface StakingMock {
  validatorPenalty?: Mock;
}

interface MockServicesInner {
  indexedDb?: IndexedDbMock;
  viewServer?: ViewServerMock;
  querier?: MockQuerier;
}

export interface MockServices {
  getWalletServices?: Mock<[], Promise<MockServicesInner>>;
  querier?: MockQuerier;
}

export interface MockExtLocalCtx {
  get: Mock;
}

export interface MockApproverCtx {
  get: Mock;
}

export interface MockExtSessionCtx {
  get: Mock;
}

export const testFullViewingKey = bech32ToFullViewingKey(
  'penumbrafullviewingkey1vzfytwlvq067g2kz095vn7sgcft47hga40atrg5zu2crskm6tyyjysm28qg5nth2fqmdf5n0q530jreumjlsrcxjwtfv6zdmfpe5kqsa5lg09',
);
