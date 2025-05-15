/* eslint-disable @typescript-eslint/no-unsafe-call -- test utils */
/* eslint-disable @typescript-eslint/no-unsafe-argument -- test utils */
/* eslint-disable @typescript-eslint/no-explicit-any -- test utils */
/* eslint-disable @typescript-eslint/require-await -- test utils */
import { fullViewingKeyFromBech32m } from '@penumbra-zone/bech32m/penumbrafullviewingkey';
import { AssetId } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { FullViewingKey, SpendKey } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import {
  IdbUpdate,
  IndexedDbInterface,
  PenumbraDb,
  PenumbraStoreNames,
} from '@penumbra-zone/types/indexed-db';
import { expect, Mock, Mocked, vi } from 'vitest';

export async function* mockSubscriptionData<T extends PenumbraStoreNames>(
  table: T,
  data: PenumbraDb[T]['value'][],
): AsyncGenerator<IdbUpdate<PenumbraDb, T>> {
  for (const value of data) {
    yield { value, table };
  }
}

const mockDisabled: any = () =>
  expect.unreachable("Mock disabled! Use this mock's `mockImplementation` method to configure it.");

export const mockStakingTokenAssetId = vi.fn(
  (): AssetId =>
    expect.unreachable(
      'Test should not get stakingTokenAssetId. Import `mockStakingTokenAssetId.mockReturnedValue` to configure this mock.',
    ),
);

export const mockIndexedDb: Mocked<IndexedDbInterface> = {
  get stakingTokenAssetId(): AssetId {
    return mockStakingTokenAssetId();
  },

  subscribe: vi.fn(async function* (_) {
    yield mockDisabled();
  }),

  addAuctionOutstandingReserves: vi.fn(mockDisabled),
  addEpoch: vi.fn(mockDisabled),
  addPosition: vi.fn(mockDisabled),
  clear: vi.fn(mockDisabled),
  clearSwapBasedPrices: vi.fn(mockDisabled),
  clearValidatorInfos: vi.fn(mockDisabled),
  constants: vi.fn(mockDisabled),
  deleteAuctionOutstandingReserves: vi.fn(mockDisabled),
  getAltGasPrices: vi.fn(mockDisabled),
  getAppParams: vi.fn(mockDisabled),
  getAssetsMetadata: vi.fn(mockDisabled),
  getAuction: vi.fn(mockDisabled),
  getAuctionOutstandingReserves: vi.fn(mockDisabled),
  getBlockHeightByEpoch: vi.fn(mockDisabled),
  getEpochByHeight: vi.fn(mockDisabled),
  getFmdParams: vi.fn(mockDisabled),
  getFullSyncHeight: vi.fn(mockDisabled),
  getLQTHistoricalVotes: vi.fn(mockDisabled),
  getNativeGasPrices: vi.fn(mockDisabled),
  getNotesForVoting: vi.fn(mockDisabled),
  getOwnedPositionIds: vi.fn(mockDisabled),
  getPosition: vi.fn(mockDisabled),
  getPricesForAsset: vi.fn(mockDisabled),
  getSpendableNoteByCommitment: vi.fn(mockDisabled),
  getSpendableNoteByNullifier: vi.fn(mockDisabled),
  getStateCommitmentTree: vi.fn(mockDisabled),
  getSwapByCommitment: vi.fn(mockDisabled),
  getSwapByNullifier: vi.fn(mockDisabled),
  getTransaction: vi.fn(mockDisabled),
  getTransactionInfo: vi.fn(mockDisabled),
  getValidatorInfo: vi.fn(mockDisabled),
  hasTokenBalance: vi.fn(mockDisabled),
  iterateAssetsMetadata: vi.fn(mockDisabled),
  iterateLQTVotes: vi.fn(mockDisabled),
  iterateSpendableNotes: vi.fn(mockDisabled),
  iterateSwaps: vi.fn(mockDisabled),
  iterateTransactions: vi.fn(mockDisabled),
  iterateValidatorInfos: vi.fn(mockDisabled),
  saveAppParams: vi.fn(mockDisabled),
  saveAssetsMetadata: vi.fn(mockDisabled),
  saveFmdParams: vi.fn(mockDisabled),
  saveFullSyncHeight: vi.fn(mockDisabled),
  saveGasPrices: vi.fn(mockDisabled),
  saveLQTHistoricalVote: vi.fn(mockDisabled),
  saveScanResult: vi.fn(mockDisabled),
  saveSpendableNote: vi.fn(mockDisabled),
  saveSwap: vi.fn(mockDisabled),
  saveTransaction: vi.fn(mockDisabled),
  saveTransactionInfo: vi.fn(mockDisabled),
  totalNoteBalance: vi.fn(mockDisabled),
  updatePosition: vi.fn(mockDisabled),
  updatePrice: vi.fn(mockDisabled),
  upsertAuction: vi.fn(mockDisabled),
  upsertValidatorInfo: vi.fn(mockDisabled),
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
