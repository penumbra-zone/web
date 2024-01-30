import { beforeEach, describe, expect, test, vi } from 'vitest';
import { DEFAULT_FMD_PARAMETERS, transactionPlanner } from './transaction-planner';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { HandlerContext } from '@connectrpc/connect';
import {
  ChainParameters,
  FmdParameters,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/chain/v1alpha1/chain_pb';

const getMockTxPlannerInstance = vi.hoisted(() => () => ({
  expiryHeight: vi.fn(),
  memo: vi.fn(),
  fee: vi.fn(),
  output: vi.fn(),
  ics20Withdrawal: vi.fn(),
  plan: vi.fn(),
}));

const { MockTxPlanner, mockGetAddressByIndex } = vi.hoisted(() => ({
  MockTxPlanner: {
    initialize: vi.fn().mockImplementation(getMockTxPlannerInstance),
  },

  mockGetAddressByIndex: vi.fn(),
}));

vi.mock('@penumbra-zone/wasm-ts', () => ({
  TxPlanner: MockTxPlanner,
  getAddressByIndex: mockGetAddressByIndex,
}));

describe('transactionPlanner()', () => {
  beforeEach(() => {
    MockTxPlanner.initialize.mockClear();
  });

  const mockQuerier = {
    app: {
      chainParams: vi.fn().mockImplementation(() => new ChainParameters()),
    },
  };

  const mockIndexedDb = {
    getFmdParams: vi.fn(),
    constants: vi.fn().mockImplementation(() => ({
      name: 'name',
      version: 1,
      tables: {},
    })),
  };

  const mockServices = {
    getWalletServices: () => ({
      indexedDb: mockIndexedDb,
      viewServer: { fullViewingKey: 'fvk' },
    }),
    querier: mockQuerier,
  };

  const mockContext = {
    values: {
      get: () => mockServices,
    },
  } as unknown as HandlerContext;

  describe('when there are no FMD parameters in IndexedDB', () => {
    beforeEach(() => {
      mockIndexedDb.getFmdParams.mockImplementation(() => undefined);
    });

    test('uses defaults of 0 precision bits and a block height of 1n', async () => {
      const req = new TransactionPlannerRequest();
      await transactionPlanner(req, mockContext);

      expect(MockTxPlanner.initialize).toHaveBeenCalledWith(
        expect.objectContaining({
          fmdParams: DEFAULT_FMD_PARAMETERS,
        }),
      );
    });
  });

  describe('when there are FMD parameters in IndexedDB', () => {
    const fmdParameters = new FmdParameters({ asOfBlockHeight: 123n, precisionBits: 1234 });

    beforeEach(() => {
      mockIndexedDb.getFmdParams.mockImplementation(() => fmdParameters);
    });

    test('uses them', async () => {
      const req = new TransactionPlannerRequest();
      await transactionPlanner(req, mockContext);

      expect(MockTxPlanner.initialize).toHaveBeenCalledWith(
        expect.objectContaining({
          fmdParams: fmdParameters,
        }),
      );
    });
  });
});
