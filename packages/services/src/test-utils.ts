import {
  FullViewingKey,
  SpendKey,
  WalletId,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { fullViewingKeyFromBech32m } from '@penumbra-zone/bech32m/penumbrafullviewingkey';
import { Mock, vi } from 'vitest';
import { DatabaseCtx, dbCtx } from './ctx/database';
import {
  HandlerContext,
  Transport,
  createContextValues,
  createHandlerContext,
  createRouterTransport,
} from '@connectrpc/connect';
import { fvkCtx } from './ctx/full-viewing-key';
import { fullnodeCtx } from './ctx/fullnode';
import { approverCtx } from './ctx/approver';
import { walletIdCtx } from './ctx/wallet-id';
import { skCtx } from './ctx/spend-key';
import { ServiceType } from '@bufbuild/protobuf';

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
export const mockAuctionService = {
  auctionStateById: vi.fn(),
};

export const mockTendermintService = {
  getTx: vi.fn(),
  getStatus: vi.fn(),
  broadcastTxSync: vi.fn(),
};

export const mockAppService = {
  appParameters: vi.fn(),
};
export const mockStakeService = { validatorPenalty: vi.fn() };

export const mockShieldedPoolService = {
  assetMetadataById: vi.fn(),
};

export const mockIndexedDb: {
  [K in keyof DatabaseCtx]: Mock<Parameters<DatabaseCtx[K]>, ReturnType<DatabaseCtx[K]>>;
} = {
  constants: vi.fn(() => ({
    name: 'Mock Database',
    version: 999,
    tables: {
      assets: 'ASSETS',
      auctions: 'AUCTIONS',
      auction_outstanding_reserves: 'AUCTION_OUTSTANDING_RESERVES',
      advice_notes: 'ADVICE_NOTES',
      spendable_notes: 'SPENDABLE_NOTES',
      swaps: 'SWAPS',
      fmd_parameters: 'FMD_PARAMETERS',
      app_parameters: 'APP_PARAMETERS',
      gas_prices: 'GAS_PRICES',
      epochs: 'EPOCHS',
      prices: 'PRICES',
      validator_infos: 'VALIDATOR_INFOS',
      transactions: 'TRANSACTIONS',
      full_sync_height: 'FULL_SYNC_HEIGHT',
    } as const,
  })),
  addAuctionOutstandingReserves: vi.fn(),
  addEpoch: vi.fn(),
  addPosition: vi.fn(),
  deleteAuctionOutstandingReserves: vi.fn(),
  getAppParams: vi.fn(),
  getAssetsMetadata: vi.fn(),
  getAuction: vi.fn(),
  getAuctionOutstandingReserves: vi.fn(),
  getEpochByHeight: vi.fn(),
  getFmdParams: vi.fn(),
  getFullSyncHeight: vi.fn(),
  getPricesForAsset: vi.fn(),
  getGasPrices: vi.fn(),
  getNotesForVoting: vi.fn(),
  getOwnedPositionIds: vi.fn(),
  getSpendableNoteByCommitment: vi.fn(),
  getSpendableNoteByNullifier: vi.fn(),
  getStateCommitmentTree: vi.fn(),
  getSwapByCommitment: vi.fn(),
  getSwapByNullifier: vi.fn(),
  getTransaction: vi.fn(),
  getValidatorInfo: vi.fn(),
  iterateAssetsMetadata: vi.fn(),
  iterateSpendableNotes: vi.fn(),
  iterateSwaps: vi.fn(),
  iterateTransactionInfo: vi.fn(),
  iterateValidatorInfos: vi.fn(),
  saveAppParams: vi.fn(),
  saveAssetsMetadata: vi.fn(),
  saveFmdParams: vi.fn(),
  saveGasPrices: vi.fn(),
  saveScanResult: vi.fn(),
  saveSpendableNote: vi.fn(),
  saveSwap: vi.fn(),
  saveTransaction: vi.fn(),
  subscribeFullSyncHeight: vi.fn(),
  subscribeSpendableNoteRecords: vi.fn(),
  subscribeSwapRecords: vi.fn(),
  subscribeTransactionInfo: vi.fn(),
  updatePosition: vi.fn(),
  updatePrice: vi.fn(),
  upsertAuction: vi.fn(),
  upsertValidatorInfo: vi.fn(),
};

type MockContextValues = Partial<{
  approver: Mock;
  db: Partial<typeof mockIndexedDb>;
  fullnode: Transport;
  fvk: FullViewingKey;
  sk: SpendKey;
  walletId: WalletId;
}>;

export const createMockContextValues = ({
  approver,
  db = mockIndexedDb,
  fullnode = createRouterTransport(() => null),
  fvk,
  sk,
  walletId,
}: MockContextValues) => {
  const ctx = createContextValues()
    .set(fullnodeCtx, () => Promise.resolve(fullnode))
    .set(dbCtx, () => Promise.resolve(db as unknown as DatabaseCtx));
  if (fvk) ctx.set(fvkCtx, () => Promise.resolve(fvk));
  if (sk) ctx.set(skCtx, () => Promise.resolve(sk));
  if (walletId) ctx.set(walletIdCtx, () => Promise.resolve(walletId));
  if (approver) ctx.set(approverCtx, approver);

  return ctx;
};

export const createMockContext = <S extends ServiceType, M extends keyof S['methods']>(
  serviceType: S,
  methodName: string & M,
  mockContext?: MockContextValues,
): HandlerContext =>
  createHandlerContext({
    requestMethod: 'MOCK',
    protocolName: 'mock',
    url: '/mock',
    service: serviceType,
    method: serviceType.methods[methodName]!,
    contextValues: createMockContextValues(mockContext ?? {}),
  });
