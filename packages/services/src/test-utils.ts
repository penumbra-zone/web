/* eslint-disable @typescript-eslint/no-explicit-any -- test utils */
/* eslint-disable @typescript-eslint/require-await -- test utils */

import { Mock, Mocked, vi } from 'vitest';
import { FullViewingKey, SpendKey } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { fullViewingKeyFromBech32m } from '@penumbra-zone/bech32m/penumbrafullviewingkey';
import { IndexedDbInterface } from '@penumbra-zone/types/indexed-db';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

export const mockIndexedDb: Mocked<IndexedDbInterface> = {
  addAuctionOutstandingReserves: vi.fn(),
  addEpoch: vi.fn(),
  addPosition: vi.fn(),
  clear: vi.fn(),
  clearSwapBasedPrices: vi.fn(),
  clearValidatorInfos: vi.fn(),
  constants: vi.fn(),
  deleteAuctionOutstandingReserves: vi.fn(),
  getAltGasPrices: vi.fn(),
  getAppParams: vi.fn(),
  getAssetsMetadata: vi.fn(),
  getAuction: vi.fn(),
  getAuctionOutstandingReserves: vi.fn(),
  getEpochByHeight: vi.fn(),
  getEpochByIndex: vi.fn(),
  getFmdParams: vi.fn(),
  getFullSyncHeight: vi.fn(),
  getLQTHistoricalVotes: vi.fn(),
  getNativeGasPrices: vi.fn(),
  getNotesForVoting: vi.fn(),
  getOwnedPositionIds: vi.fn(async function* (..._) {
    yield* [] as any[];
  }),
  getPosition: vi.fn(),
  getPricesForAsset: vi.fn(),
  getSpendableNoteByCommitment: vi.fn(),
  getSpendableNoteByNullifier: vi.fn(),
  getStateCommitmentTree: vi.fn(),
  getSwapByCommitment: vi.fn(),
  getSwapByNullifier: vi.fn(),
  getTransaction: vi.fn(),
  getTransactionInfo: vi.fn(),
  getValidatorInfo: vi.fn(),
  hasTokenBalance: vi.fn(),
  iterateAssetsMetadata: vi.fn(async function* () {
    yield* [] as any[];
  }),
  iterateLQTVotes: vi.fn(async function* (..._) {
    yield* [] as any[];
  }),
  iterateSpendableNotes: vi.fn(async function* () {
    yield* [] as any[];
  }),
  iterateSwaps: vi.fn(async function* () {
    yield* [] as any[];
  }),
  iterateTransactions: vi.fn(async function* () {
    yield* [] as any[];
  }),
  iterateValidatorInfos: vi.fn(async function* () {
    yield* [] as any[];
  }),
  saveAppParams: vi.fn(),
  saveAssetsMetadata: vi.fn(),
  saveFmdParams: vi.fn(),
  saveFullSyncHeight: vi.fn(),
  saveGasPrices: vi.fn(),
  saveLQTHistoricalVote: vi.fn(),
  saveScanResult: vi.fn(),
  saveSpendableNote: vi.fn(),
  saveSwap: vi.fn(),
  saveTransaction: vi.fn(),
  saveTransactionInfo: vi.fn(),
  stakingTokenAssetId: new AssetId({}),
  subscribe: vi.fn(async function* (_) {
    yield* [] as any[];
  }),
  totalNoteBalance: vi.fn(),
  updatePosition: vi.fn(),
  updatePrice: vi.fn(),
  upsertAuction: vi.fn(),
  upsertValidatorInfo: vi.fn(),
};

export interface AuctionMock {
  auctionStateById: Mock;
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

export interface MockQuerier {
  auction?: AuctionMock;
  tendermint?: TendermintMock;
  sct?: SctMock;
  shieldedPool?: ShieldedPoolMock;
  stake?: StakeMock;
  funding?: FundingMock;
}

export interface FundingMock {
  lqtCheckNullifier?: Mock;
}

export interface SctMock {
  timestampByHeight?: Mock;
}

export interface StakeMock {
  validatorPenalty?: Mock;
  validatorInfo?: Mock;
}

interface MockServicesInner {
  indexedDb?: Mocked<IndexedDbInterface>;
  viewServer?: ViewServerMock;
  querier?: MockQuerier;
}

export interface MockServices {
  getWalletServices?: Mock<[], Promise<MockServicesInner>>;
}

export interface MockApproverCtx {
  get: Mock;
}

export const testFullViewingKey = new FullViewingKey(
  fullViewingKeyFromBech32m(
    'penumbrafullviewingkey1vzfytwlvq067g2kz095vn7sgcft47hga40atrg5zu2crskm6tyyjysm28qg5nth2fqmdf5n0q530jreumjlsrcxjwtfv6zdmfpe5kqsa5lg09',
  ),
);

export const testSpendKey = new SpendKey({
  inner: new Uint8Array([
    204, 36, 107, 26, 105, 251, 139, 204, 14, 247, 98, 33, 115, 24, 32, 181, 165, 4, 171, 182, 171,
    238, 171, 186, 29, 152, 153, 61, 26, 149, 83, 166,
  ]),
});
