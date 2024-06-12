import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import {
  SwapByCommitmentRequest,
  SwapByCommitmentResponse,
  SwapRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import { DbMock } from '../test-utils';
import { StateCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1/tct_pb';
import { swapByCommitment } from './swap-by-commitment';
import { dbCtx } from '../ctx/database';
import { DatabaseCtx } from '../ctx/database';

describe('SwapByCommitment request handler', () => {
  let mockIndexedDb: DbMock;
  let mockCtx: HandlerContext;
  let request: SwapByCommitmentRequest;
  let swapSubNext: Mock;

  beforeEach(() => {
    vi.resetAllMocks();

    swapSubNext = vi.fn();
    const mockSwapSubscription = {
      next: swapSubNext,
      [Symbol.asyncIterator]: () => mockSwapSubscription,
    };

    mockIndexedDb = {
      getSwapByCommitment: vi.fn(),
      subscribe: () => mockSwapSubscription,
    };

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.swapByCommitment,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(dbCtx, () =>
        Promise.resolve(mockIndexedDb as unknown as DatabaseCtx),
      ),
    });

    request = new SwapByCommitmentRequest({ swapCommitment: testCommitment });
  });

  test('should successfully get swap by commitment when idb has them', async () => {
    mockIndexedDb.getSwapByCommitment?.mockResolvedValue(testSwap);
    const swapByCommitmentResponse = new SwapByCommitmentResponse(
      await swapByCommitment(request, mockCtx),
    );
    expect(swapByCommitmentResponse.swap?.equals(testSwap)).toBeTruthy();
  });

  test('should throw error if idb has none', async () => {
    await expect(swapByCommitment(new SwapByCommitmentRequest(), mockCtx)).rejects.toThrow(
      'Missing swap commitment in request',
    );
  });

  test('should throw an error if swap  no found in idb and awaitDetection is false', async () => {
    mockIndexedDb.getSwapByCommitment?.mockResolvedValue(undefined);
    request.awaitDetection = false;
    await expect(swapByCommitment(request, mockCtx)).rejects.toThrow('Swap not found');
  });

  test('should get swap if swap is not found in idb, but awaitDetection is true, and has been detected', async () => {
    mockIndexedDb.getSwapByCommitment?.mockResolvedValue(undefined);
    request.awaitDetection = true;
    swapSubNext.mockResolvedValueOnce({
      value: { value: testSwap.toJson() },
    });
    const swapByCommitmentResponse = new SwapByCommitmentResponse(
      await swapByCommitment(request, mockCtx),
    );
    expect(swapByCommitmentResponse.swap?.equals(testSwap)).toBeTruthy();
  });

  test('should throw error if swap is not found in idb, and has not been detected', async () => {
    mockIndexedDb.getSwapByCommitment?.mockResolvedValue(undefined);
    request.awaitDetection = true;

    swapSubNext.mockResolvedValueOnce({
      value: { value: swapWithAnotherCommitment.toJson() },
    });
    swapSubNext.mockResolvedValueOnce({
      done: true,
    });
    await expect(swapByCommitment(request, mockCtx)).rejects.toThrow('Swap not found');
  });
});

const testCommitment = StateCommitment.fromJson({
  inner: 'A6VBVkrk+s18q+Sjhl8uEGfS3i0dwF1FrkNm8Db6VAA=',
});

const testSwap = SwapRecord.fromJson({
  swapCommitment: { inner: 'A6VBVkrk+s18q+Sjhl8uEGfS3i0dwF1FrkNm8Db6VAA=' },
  swap: {
    tradingPair: {
      asset1: { inner: 'HW2Eq3UZVSBttoUwUi/MUtE7rr2UU7/UH500byp7OAc=' },
      asset2: { inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=' },
    },
    delta1I: {},
    delta2I: { lo: '1000000' },
    claimFee: { amount: {} },
    claimAddress: {
      inner:
        '2VQ9nQKqga8RylgOq+wAY3/Hmxg96mGnI+Te/BRnXWpr5bSxpLShbpOmzO4pPULf+tGjaBum6InyEpipJ+8wk+HufrvSBa43H9o2ir5WPbk=',
    },
    rseed: 'RPuhZ9q2F3XHbTcDPRTHnJjJaMxv8hes4TzJuMbsA/k=',
  },
  position: '2383742304257',
  nullifier: { inner: 'dE7LbhBDgDXHiRvreFyCllcKOOQeuIVsbn2aw8uKhww=' },
  outputData: {
    delta1: {},
    delta2: { lo: '1000000' },
    lambda1: { lo: '2665239' },
    lambda2: {},
    unfilled1: {},
    unfilled2: {},
    height: '356591',
    tradingPair: {
      asset1: { inner: 'HW2Eq3UZVSBttoUwUi/MUtE7rr2UU7/UH500byp7OAc=' },
      asset2: { inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=' },
    },
    epochStartingHeight: '356050',
  },
  source: {
    transaction: {
      id: '9e1OaxysQAzHUUKsroXMNRCzlPxd6hBWLrqURgNBrmE=',
    },
  },
});

const swapWithAnotherCommitment = SwapRecord.fromJson({
  swapCommitment: {
    inner: 'n86D13I1rRUDoLCkX7LKl/AG8/F+2MV76p4XgPD++xA=',
  },
});
