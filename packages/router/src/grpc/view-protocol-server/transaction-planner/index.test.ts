import { beforeEach, describe, expect, test, vi } from 'vitest';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { servicesCtx } from '../../../ctx/prax';
import { IndexedDbMock, MockServices, ViewServerMock } from '../../test-utils';
import type { Services } from '@penumbra-zone/services/src/index';
import { FmdParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import { AppParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/app/v1/app_pb';
import { SctParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1/sct_pb';
import { GasPrices } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1/fee_pb';
import { transactionPlanner } from '.';

const mockPlanTransaction = vi.hoisted(() => vi.fn());
vi.mock('@penumbra-zone/wasm/src/planner', () => ({
  planTransaction: mockPlanTransaction,
}));
describe('TransactionPlanner request handler', () => {
  let mockServices: MockServices;
  let mockIndexedDb: IndexedDbMock;
  let mockViewServer: ViewServerMock;
  let mockCtx: HandlerContext;
  let req: TransactionPlannerRequest;

  beforeEach(() => {
    vi.resetAllMocks();

    mockIndexedDb = {
      getFmdParams: vi.fn(),
      getAppParams: vi.fn(),
      getGasPrices: vi.fn(),
      constants: vi.fn(),
    };
    mockViewServer = {
      fullViewingKey:
        'penumbrafullviewingkey1vzfytwlvq067g2kz095vn7sgcft47hga40atrg5zu2crskm6tyyjysm28qg5nth2fqmdf5n0q530jreumjlsrcxjwtfv6zdmfpe5kqsa5lg09',
    };
    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({
          indexedDb: mockIndexedDb,
          viewServer: mockViewServer,
        }),
      ) as MockServices['getWalletServices'],
    };

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.transactionPlanner,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(servicesCtx, mockServices as unknown as Services),
    });

    req = new TransactionPlannerRequest({});
  });

  test('should create a transaction plan if all necessary data exists in indexed-db', async () => {
    mockIndexedDb.getFmdParams?.mockResolvedValueOnce(
      new FmdParameters({
        precisionBits: 12,
        asOfBlockHeight: 2n,
      }),
    );
    mockIndexedDb.getAppParams?.mockResolvedValueOnce(
      new AppParameters({
        chainId: 'penumbra-testnet-mock',
        sctParams: new SctParameters({
          epochDuration: 719n,
        }),
      }),
    );
    mockIndexedDb.getGasPrices?.mockResolvedValueOnce(
      new GasPrices({
        verificationPrice: 22n,
        executionPrice: 222n,
        blockSpacePrice: 2n,
        compactBlockSpacePrice: 120n,
      }),
    );
    await transactionPlanner(req, mockCtx);

    expect(mockPlanTransaction.mock.calls.length === 1).toBeTruthy();
  });

  test('should throw error if FmdParameters not available', async () => {
    await expect(transactionPlanner(req, mockCtx)).rejects.toThrow('FmdParameters not available');
  });

  test('should throw error if SctParameters not available', async () => {
    mockIndexedDb.getFmdParams?.mockResolvedValueOnce(new FmdParameters());
    mockIndexedDb.getAppParams?.mockResolvedValueOnce(
      new AppParameters({
        chainId: 'penumbra-testnet-mock',
      }),
    );
    await expect(transactionPlanner(req, mockCtx)).rejects.toThrow('SctParameters not available');
  });

  test('should throw error if ChainId not available', async () => {
    mockIndexedDb.getFmdParams?.mockResolvedValueOnce(new FmdParameters());
    mockIndexedDb.getAppParams?.mockResolvedValueOnce(
      new AppParameters({
        sctParams: new SctParameters({
          epochDuration: 719n,
        }),
      }),
    );
    await expect(transactionPlanner(req, mockCtx)).rejects.toThrow('ChainId not available');
  });

  test('should throw error if Gas prices is not available', async () => {
    mockIndexedDb.getFmdParams?.mockResolvedValueOnce(new FmdParameters());
    mockIndexedDb.getAppParams?.mockResolvedValueOnce(
      new AppParameters({
        chainId: 'penumbra-testnet-mock',
        sctParams: new SctParameters({
          epochDuration: 719n,
        }),
      }),
    );
    await expect(transactionPlanner(req, mockCtx)).rejects.toThrow('Gas prices is not available');
  });
});
