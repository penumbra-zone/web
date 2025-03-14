import { beforeEach, describe, expect, test, vi } from 'vitest';
import { create } from '@bufbuild/protobuf';
import {
  TransactionPlannerRequestSchema,
  TransactionPlannerRequest_SwapSchema,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import type { TransactionPlannerRequest } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import { servicesCtx } from '../../ctx/prax.js';
import { IndexedDbMock, MockServices, testFullViewingKey } from '../../test-utils.js';
import type { ServicesInterface } from '@penumbra-zone/types/services';
import { FmdParametersSchema } from '@penumbra-zone/protobuf/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import { AppParametersSchema } from '@penumbra-zone/protobuf/penumbra/core/app/v1/app_pb';
import { SctParametersSchema } from '@penumbra-zone/protobuf/penumbra/core/component/sct/v1/sct_pb';
import { GasPricesSchema } from '@penumbra-zone/protobuf/penumbra/core/component/fee/v1/fee_pb';
import { transactionPlanner } from './index.js';
import { fvkCtx } from '../../ctx/full-viewing-key.js';
import {
  AssetIdSchema,
  ValueSchema,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AddressIndexSchema } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { TransactionPlanSchema } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';

const mockPlanTransaction = vi.hoisted(() => vi.fn());
vi.mock('@penumbra-zone/wasm/planner', () => ({
  planTransaction: mockPlanTransaction,
}));
describe('TransactionPlanner request handler', () => {
  let mockServices: MockServices;
  let mockIndexedDb: IndexedDbMock;
  let mockCtx: HandlerContext;
  let req: TransactionPlannerRequest;

  beforeEach(() => {
    vi.resetAllMocks();

    mockIndexedDb = {
      getFmdParams: vi.fn(),
      getAppParams: vi.fn(),
      getNativeGasPrices: vi.fn(),
      constants: vi.fn(),
      hasTokenBalance: vi.fn(),
    };

    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({
          indexedDb: mockIndexedDb,
        }),
      ) as MockServices['getWalletServices'],
    };

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.method.transactionPlanner,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues()
        .set(servicesCtx, () => Promise.resolve(mockServices as unknown as ServicesInterface))
        .set(fvkCtx, () => Promise.resolve(testFullViewingKey)),
    });

    req = create(TransactionPlannerRequestSchema, {
      source: create(AddressIndexSchema, { account: 0 }),
    });
  });

  test('should throw if request is not valid', async () => {
    // Swap assets are the same
    const assetAbc = create(AssetIdSchema, { altBaseDenom: 'UM' });
    req.swaps = [
      create(TransactionPlannerRequest_SwapSchema, {
        value: create(ValueSchema, { assetId: assetAbc }),
        targetAsset: assetAbc,
      }),
    ];
    await expect(transactionPlanner(req, mockCtx)).rejects.toThrow(
      '[invalid_argument] Attempted to make a swap in which both assets were of the same type. A swap must be between two different asset types.',
    );
  });

  test('should create a transaction plan if all necessary data exists in indexed-db', async () => {
    mockIndexedDb.getFmdParams?.mockResolvedValueOnce(
      create(FmdParametersSchema, {
        precisionBits: 12,
        asOfBlockHeight: 2n,
      }),
    );
    mockIndexedDb.getAppParams?.mockResolvedValueOnce(
      create(AppParametersSchema, {
        chainId: 'penumbra-testnet-mock',
        sctParams: create(SctParametersSchema, {
          epochDuration: 719n,
        }),
      }),
    );
    mockIndexedDb.getNativeGasPrices?.mockResolvedValueOnce(
      create(GasPricesSchema, {
        verificationPrice: 22n,
        executionPrice: 222n,
        blockSpacePrice: 2n,
        compactBlockSpacePrice: 120n,
      }),
    );

    mockIndexedDb.hasTokenBalance?.mockResolvedValueOnce(true);

    mockPlanTransaction.mockResolvedValueOnce(
      create(TransactionPlanSchema, {
        transactionParameters: {
          fee: {
            assetId: create(AssetIdSchema, { altBaseDenom: 'UM' }),
            amount: { hi: 0n, lo: 0n },
          },
          chainId: 'mainnet',
          expiryHeight: 100n,
        },
      }),
    );

    await transactionPlanner(req, mockCtx);

    expect(mockPlanTransaction.mock.calls.length === 1).toBeTruthy();
  });
});
