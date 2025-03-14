import { nullifierStatus } from './nullifier-status.js';

import { create, toJson } from '@bufbuild/protobuf';

import { ViewService } from '@penumbra-zone/protobuf';
import { servicesCtx } from '../ctx/prax.js';

import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import type { ServicesInterface } from '@penumbra-zone/types/services';

import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';

import { NullifierSchema } from '@penumbra-zone/protobuf/penumbra/core/component/sct/v1/sct_pb';
import {
  NullifierStatusRequestSchema,
  SpendableNoteRecordSchema,
  SwapRecordSchema,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { IndexedDbMock, MockServices } from '../test-utils.js';
import { stringToUint8Array } from '@penumbra-zone/types/string';

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
        if (table === 'SPENDABLE_NOTES') {
          return mockNoteSubscription;
        }
        if (table === 'SWAPS') {
          return mockSwapSubscription;
        }
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
      method: ViewService.method.nullifierStatus,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(servicesCtx, () =>
        Promise.resolve(mockServices as unknown as ServicesInterface),
      ),
    });
  });

  test('returns empty response if no nullifier provided', async () => {
    const req = create(NullifierStatusRequestSchema);
    await expect(nullifierStatus(req, mockCtx)).rejects.toThrowError('No nullifier passed');
  });

  test('returns false if nullifier not found in db', async () => {
    const req = create(NullifierStatusRequestSchema, {
      nullifier: create(NullifierSchema, { inner: stringToUint8Array('nullifier_abc') }),
    });

    mockIndexedDb.getSpendableNoteByNullifier?.mockResolvedValue(undefined);
    mockIndexedDb.getSwapByNullifier?.mockResolvedValue(undefined);

    const res = await nullifierStatus(req, mockCtx);
    expect(res.spent).toBe(false);
  });

  test('returns true if nullifier found in swaps and is spent', async () => {
    const req = create(NullifierStatusRequestSchema, {
      nullifier: create(NullifierSchema, { inner: stringToUint8Array('nullifier_abc') }),
    });

    mockIndexedDb.getSpendableNoteByNullifier?.mockResolvedValue(undefined);
    mockIndexedDb.getSwapByNullifier?.mockResolvedValue(
      create(SwapRecordSchema, { heightClaimed: 324234n }),
    );

    const res = await nullifierStatus(req, mockCtx);
    expect(res.spent).toBe(true);
  });

  test('returns false if nullifier found in swaps and is not spent', async () => {
    const req = create(NullifierStatusRequestSchema, {
      nullifier: create(NullifierSchema, { inner: stringToUint8Array('nullifier_abc') }),
    });

    mockIndexedDb.getSpendableNoteByNullifier?.mockResolvedValue(undefined);
    mockIndexedDb.getSwapByNullifier?.mockResolvedValue(create(SwapRecordSchema));

    const res = await nullifierStatus(req, mockCtx);
    expect(res.spent).toBe(false);
  });

  test('returns true if nullifier found in notes and is spent', async () => {
    const req = create(NullifierStatusRequestSchema, {
      nullifier: create(NullifierSchema, { inner: stringToUint8Array('nullifier_abc') }),
    });

    mockIndexedDb.getSpendableNoteByNullifier?.mockResolvedValue(
      create(SpendableNoteRecordSchema, { heightSpent: 324234n }),
    );
    mockIndexedDb.getSwapByNullifier?.mockResolvedValue(undefined);

    const res = await nullifierStatus(req, mockCtx);
    expect(res.spent).toBe(true);
  });

  test('returns false if nullifier found in notes and is not spent', async () => {
    const req = create(NullifierStatusRequestSchema, {
      nullifier: create(NullifierSchema, { inner: stringToUint8Array('nullifier_abc') }),
    });

    mockIndexedDb.getSpendableNoteByNullifier?.mockResolvedValue(create(SpendableNoteRecordSchema));
    mockIndexedDb.getSwapByNullifier?.mockResolvedValue(undefined);

    const res = await nullifierStatus(req, mockCtx);
    expect(res.spent).toBe(false);
  });

  test('await detect corresponding note', async () => {
    mockIndexedDb.getSpendableNoteByNullifier?.mockResolvedValue(undefined);
    mockIndexedDb.getSwapByNullifier?.mockResolvedValue(undefined);

    const matchingNullifier = create(NullifierSchema, {
      inner: stringToUint8Array('nullifier_abc'),
    });

    const nonMatchingNote = create(SpendableNoteRecordSchema, {
      nullifier: create(NullifierSchema, { inner: stringToUint8Array('nope') }),
    });

    const matchingNoteNotSpent = create(SpendableNoteRecordSchema, {
      nullifier: matchingNullifier,
    });

    const matchingNoteSpent = create(SpendableNoteRecordSchema, {
      nullifier: matchingNullifier,
      heightSpent: 10314n,
    });

    const nonMatchingSwap = create(SwapRecordSchema, {
      nullifier: create(NullifierSchema, { inner: stringToUint8Array('nope') }),
    });

    // Incoming swaps with no matches
    swapSubNext
      .mockResolvedValueOnce({
        value: { value: toJson(SwapRecordSchema, nonMatchingSwap), table: 'SWAPS' },
      })
      .mockResolvedValueOnce({
        value: { value: toJson(SwapRecordSchema, nonMatchingSwap), table: 'SWAPS' },
      })
      .mockResolvedValueOnce({
        value: { value: toJson(SwapRecordSchema, nonMatchingSwap), table: 'SWAPS' },
      });

    // Incoming notes with the last one being the match
    noteSubNext
      .mockResolvedValueOnce({
        value: {
          value: toJson(SpendableNoteRecordSchema, nonMatchingNote),
          table: 'SPENDABLE_NOTES',
        },
      })
      .mockResolvedValueOnce({
        value: {
          value: toJson(SpendableNoteRecordSchema, matchingNoteNotSpent),
          table: 'SPENDABLE_NOTES',
        },
      })
      .mockResolvedValueOnce({
        value: {
          value: toJson(SpendableNoteRecordSchema, matchingNoteSpent),
          table: 'SPENDABLE_NOTES',
        },
      });

    const req = create(NullifierStatusRequestSchema, {
      nullifier: matchingNullifier,
      awaitDetection: true,
    });

    const res = await nullifierStatus(req, mockCtx);
    expect(res.spent).toBe(true);
  });

  test('await detect corresponding swap', async () => {
    mockIndexedDb.getSpendableNoteByNullifier?.mockResolvedValue(undefined);
    mockIndexedDb.getSwapByNullifier?.mockResolvedValue(undefined);

    const matchingNullifier = create(NullifierSchema, {
      inner: stringToUint8Array('nullifier_abc'),
    });

    const nonMatchingSwap = create(SwapRecordSchema, {
      nullifier: create(NullifierSchema, { inner: stringToUint8Array('nope') }),
    });

    const matchingSwapNotSpent = create(SwapRecordSchema, {
      nullifier: matchingNullifier,
    });

    const matchingSwapSpent = create(SwapRecordSchema, {
      nullifier: matchingNullifier,
      heightClaimed: 10314n,
    });

    // Incoming swaps with the last one being the match
    swapSubNext
      .mockResolvedValueOnce({
        value: { value: toJson(SwapRecordSchema, nonMatchingSwap), table: 'SWAPS' },
      })
      .mockResolvedValueOnce({
        value: { value: toJson(SwapRecordSchema, matchingSwapNotSpent), table: 'SWAPS' },
      })
      .mockResolvedValueOnce({
        value: { value: toJson(SwapRecordSchema, matchingSwapSpent), table: 'SWAPS' },
      });

    const nonMatchingNote = create(SpendableNoteRecordSchema, {
      nullifier: create(NullifierSchema, { inner: stringToUint8Array('nope') }),
    });

    // Incoming notes with no matches
    noteSubNext
      .mockResolvedValueOnce({
        value: {
          value: toJson(SpendableNoteRecordSchema, nonMatchingNote),
          table: 'SPENDABLE_NOTES',
        },
      })
      .mockResolvedValueOnce({
        value: {
          value: toJson(SpendableNoteRecordSchema, nonMatchingNote),
          table: 'SPENDABLE_NOTES',
        },
      })
      .mockResolvedValueOnce({
        value: {
          value: toJson(SpendableNoteRecordSchema, nonMatchingNote),
          table: 'SPENDABLE_NOTES',
        },
      })
      .mockResolvedValueOnce({
        value: {
          value: toJson(SpendableNoteRecordSchema, nonMatchingNote),
          table: 'SPENDABLE_NOTES',
        },
      })
      .mockResolvedValueOnce({
        value: {
          value: toJson(SpendableNoteRecordSchema, nonMatchingNote),
          table: 'SPENDABLE_NOTES',
        },
      });

    const req = create(NullifierStatusRequestSchema, {
      nullifier: matchingNullifier,
      awaitDetection: true,
    });

    const res = await nullifierStatus(req, mockCtx);
    expect(res.spent).toBe(true);
  });
});
