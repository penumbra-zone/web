import { nullifierStatus } from './nullifier-status';

import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { servicesCtx } from '../../ctx';

import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import type { Services } from '@penumbra-zone/services';

import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';

import { Nullifier } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1/sct_pb';
import {
  NullifierStatusRequest,
  SpendableNoteRecord,
  SwapRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { IndexedDbMock, MockServices } from '../test-utils';
import { stringToUint8Array } from '@penumbra-zone/types/src/string';

describe('nullifierStatus', () => {
  let mockServices: MockServices;
  let mockIndexedDb: IndexedDbMock;
  let mockCtx: HandlerContext;
  let noteSubNext: Mock;
  let swapSubNext: Mock;

  beforeEach(() => {
    vi.resetAllMocks();

    noteSubNext = vi.fn();
    const mockNoteSubscription = {
      next: noteSubNext,
      [Symbol.asyncIterator]: () => mockNoteSubscription,
    };

    swapSubNext = vi.fn();
    const mockSwapSubscription = {
      next: swapSubNext,
      [Symbol.asyncIterator]: () => mockSwapSubscription,
    };

    mockIndexedDb = {
      getSpendableNoteByNullifier: vi.fn(),
      getSwapByNullifier: vi.fn(),
      subscribe: (table: string) => {
        if (table === 'SPENDABLE_NOTES') return mockNoteSubscription;
        if (table === 'SWAPS') return mockSwapSubscription;
        throw new Error('Table not supported');
      },
    };
    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({ indexedDb: mockIndexedDb }),
      ) as MockServices['getWalletServices'],
    };

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.nullifierStatus,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(servicesCtx, mockServices as unknown as Services),
    });
  });

  test('returns empty response if no nullifier provided', async () => {
    const req = new NullifierStatusRequest();
    await expect(nullifierStatus(req, mockCtx)).rejects.toThrowError('No nullifier passed');
  });

  test('returns false if nullifier not found in db', async () => {
    const req = new NullifierStatusRequest({
      nullifier: new Nullifier({ inner: stringToUint8Array('nullifier_abc') }),
    });

    mockIndexedDb.getSpendableNoteByNullifier?.mockResolvedValue(undefined);
    mockIndexedDb.getSwapByNullifier?.mockResolvedValue(undefined);

    const res = await nullifierStatus(req, mockCtx);
    expect(res.spent).toBe(false);
  });

  test('returns true if nullifier found in swaps and is spent', async () => {
    const req = new NullifierStatusRequest({
      nullifier: new Nullifier({ inner: stringToUint8Array('nullifier_abc') }),
    });

    mockIndexedDb.getSpendableNoteByNullifier?.mockResolvedValue(undefined);
    mockIndexedDb.getSwapByNullifier?.mockResolvedValue(new SwapRecord({ heightClaimed: 324234n }));

    const res = await nullifierStatus(req, mockCtx);
    expect(res.spent).toBe(true);
  });

  test('returns false if nullifier found in swaps and is not spent', async () => {
    const req = new NullifierStatusRequest({
      nullifier: new Nullifier({ inner: stringToUint8Array('nullifier_abc') }),
    });

    mockIndexedDb.getSpendableNoteByNullifier?.mockResolvedValue(undefined);
    mockIndexedDb.getSwapByNullifier?.mockResolvedValue(new SwapRecord());

    const res = await nullifierStatus(req, mockCtx);
    expect(res.spent).toBe(false);
  });

  test('returns true if nullifier found in notes and is spent', async () => {
    const req = new NullifierStatusRequest({
      nullifier: new Nullifier({ inner: stringToUint8Array('nullifier_abc') }),
    });

    mockIndexedDb.getSpendableNoteByNullifier?.mockResolvedValue(
      new SpendableNoteRecord({ heightSpent: 324234n }),
    );
    mockIndexedDb.getSwapByNullifier?.mockResolvedValue(undefined);

    const res = await nullifierStatus(req, mockCtx);
    expect(res.spent).toBe(true);
  });

  test('returns false if nullifier found in notes and is not spent', async () => {
    const req = new NullifierStatusRequest({
      nullifier: new Nullifier({ inner: stringToUint8Array('nullifier_abc') }),
    });

    mockIndexedDb.getSpendableNoteByNullifier?.mockResolvedValue(new SpendableNoteRecord());
    mockIndexedDb.getSwapByNullifier?.mockResolvedValue(undefined);

    const res = await nullifierStatus(req, mockCtx);
    expect(res.spent).toBe(false);
  });

  test('await detect corresponding note', async () => {
    mockIndexedDb.getSpendableNoteByNullifier?.mockResolvedValue(undefined);
    mockIndexedDb.getSwapByNullifier?.mockResolvedValue(undefined);

    const matchingNullifier = new Nullifier({ inner: stringToUint8Array('nullifier_abc') });

    const nonMatchingNote = new SpendableNoteRecord({
      nullifier: new Nullifier({ inner: stringToUint8Array('nope') }),
    });

    const matchingNoteNotSpent = new SpendableNoteRecord({
      nullifier: matchingNullifier,
    });

    const matchingNoteSpent = new SpendableNoteRecord({
      nullifier: matchingNullifier,
      heightSpent: 10314n,
    });

    const nonMatchingSwap = new SwapRecord({
      nullifier: new Nullifier({ inner: stringToUint8Array('nope') }),
    });

    // Incoming swaps with no matches
    swapSubNext
      .mockResolvedValueOnce({
        value: { value: nonMatchingSwap.toJson(), table: 'SWAPS' },
      })
      .mockResolvedValueOnce({
        value: { value: nonMatchingSwap.toJson(), table: 'SWAPS' },
      })
      .mockResolvedValueOnce({
        value: { value: nonMatchingSwap.toJson(), table: 'SWAPS' },
      });

    // Incoming notes with the last one being the match
    noteSubNext
      .mockResolvedValueOnce({
        value: { value: nonMatchingNote.toJson(), table: 'SPENDABLE_NOTES' },
      })
      .mockResolvedValueOnce({
        value: { value: matchingNoteNotSpent.toJson(), table: 'SPENDABLE_NOTES' },
      })
      .mockResolvedValueOnce({
        value: { value: matchingNoteSpent.toJson(), table: 'SPENDABLE_NOTES' },
      });

    const req = new NullifierStatusRequest({
      nullifier: matchingNullifier,
      awaitDetection: true,
    });

    const res = await nullifierStatus(req, mockCtx);
    expect(res.spent).toBe(true);
  });

  test('await detect corresponding swap', async () => {
    mockIndexedDb.getSpendableNoteByNullifier?.mockResolvedValue(undefined);
    mockIndexedDb.getSwapByNullifier?.mockResolvedValue(undefined);

    const matchingNullifier = new Nullifier({ inner: stringToUint8Array('nullifier_abc') });

    const nonMatchingSwap = new SwapRecord({
      nullifier: new Nullifier({ inner: stringToUint8Array('nope') }),
    });

    const matchingSwapNotSpent = new SwapRecord({
      nullifier: matchingNullifier,
    });

    const matchingSwapSpent = new SwapRecord({
      nullifier: matchingNullifier,
      heightClaimed: 10314n,
    });

    // Incoming swaps with the last one being the match
    swapSubNext
      .mockResolvedValueOnce({
        value: { value: nonMatchingSwap.toJson(), table: 'SWAPS' },
      })
      .mockResolvedValueOnce({
        value: { value: matchingSwapNotSpent.toJson(), table: 'SWAPS' },
      })
      .mockResolvedValueOnce({
        value: { value: matchingSwapSpent.toJson(), table: 'SWAPS' },
      });

    const nonMatchingNote = new SpendableNoteRecord({
      nullifier: new Nullifier({ inner: stringToUint8Array('nope') }),
    });

    // Incoming notes with no matches
    noteSubNext
      .mockResolvedValueOnce({
        value: { value: nonMatchingNote.toJson(), table: 'SPENDABLE_NOTES' },
      })
      .mockResolvedValueOnce({
        value: { value: nonMatchingNote.toJson(), table: 'SPENDABLE_NOTES' },
      })
      .mockResolvedValueOnce({
        value: { value: nonMatchingNote.toJson(), table: 'SPENDABLE_NOTES' },
      })
      .mockResolvedValueOnce({
        value: { value: nonMatchingNote.toJson(), table: 'SPENDABLE_NOTES' },
      })
      .mockResolvedValueOnce({
        value: { value: nonMatchingNote.toJson(), table: 'SPENDABLE_NOTES' },
      });

    const req = new NullifierStatusRequest({
      nullifier: matchingNullifier,
      awaitDetection: true,
    });

    const res = await nullifierStatus(req, mockCtx);
    expect(res.spent).toBe(true);
  });
});
