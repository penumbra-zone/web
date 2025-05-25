import { nullifierStatus } from './nullifier-status.js';

import { ViewService } from '@penumbra-zone/protobuf';
import { servicesCtx } from '../ctx/prax.js';

import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import type { ServicesInterface } from '@penumbra-zone/types/services';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { Nullifier } from '@penumbra-zone/protobuf/penumbra/core/component/sct/v1/sct_pb';
import {
  NullifierStatusRequest,
  SpendableNoteRecord,
  SwapRecord,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { mockIndexedDb, MockServices, createUpdates } from '../test-utils.js';
import { stringToUint8Array } from '@penumbra-zone/types/string';

describe('nullifierStatus', () => {
  let mockServices: MockServices;
  let mockCtx: HandlerContext;

  beforeEach(() => {
    vi.resetAllMocks();

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
      contextValues: createContextValues().set(servicesCtx, () =>
        Promise.resolve(mockServices as unknown as ServicesInterface),
      ),
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

    mockIndexedDb.getSpendableNoteByNullifier.mockResolvedValue(undefined);
    mockIndexedDb.getSwapByNullifier.mockResolvedValue(undefined);

    const res = await nullifierStatus(req, mockCtx);
    expect(res.spent).toBe(false);
  });

  test('returns true if nullifier found in swaps and is spent', async () => {
    const req = new NullifierStatusRequest({
      nullifier: new Nullifier({ inner: stringToUint8Array('nullifier_abc') }),
    });

    mockIndexedDb.getSpendableNoteByNullifier.mockResolvedValue(undefined);
    mockIndexedDb.getSwapByNullifier.mockResolvedValue(new SwapRecord({ heightClaimed: 324234n }));

    const res = await nullifierStatus(req, mockCtx);
    expect(res.spent).toBe(true);
  });

  test('returns false if nullifier found in swaps and is not spent', async () => {
    const req = new NullifierStatusRequest({
      nullifier: new Nullifier({ inner: stringToUint8Array('nullifier_abc') }),
    });

    mockIndexedDb.getSpendableNoteByNullifier.mockResolvedValue(undefined);
    mockIndexedDb.getSwapByNullifier.mockResolvedValue(new SwapRecord());

    const res = await nullifierStatus(req, mockCtx);
    expect(res.spent).toBe(false);
  });

  test('returns true if nullifier found in notes and is spent', async () => {
    const req = new NullifierStatusRequest({
      nullifier: new Nullifier({ inner: stringToUint8Array('nullifier_abc') }),
    });

    mockIndexedDb.getSpendableNoteByNullifier.mockResolvedValue(
      new SpendableNoteRecord({ heightSpent: 324234n }),
    );
    mockIndexedDb.getSwapByNullifier.mockResolvedValue(undefined);

    const res = await nullifierStatus(req, mockCtx);
    expect(res.spent).toBe(true);
  });

  test('returns false if nullifier found in notes and is not spent', async () => {
    const req = new NullifierStatusRequest({
      nullifier: new Nullifier({ inner: stringToUint8Array('nullifier_abc') }),
    });

    mockIndexedDb.getSpendableNoteByNullifier.mockResolvedValue(new SpendableNoteRecord());
    mockIndexedDb.getSwapByNullifier.mockResolvedValue(undefined);

    const res = await nullifierStatus(req, mockCtx);
    expect(res.spent).toBe(false);
  });

  test('await detect corresponding note', async () => {
    mockIndexedDb.getSpendableNoteByNullifier.mockResolvedValue(undefined);
    mockIndexedDb.getSwapByNullifier.mockResolvedValue(undefined);

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

    mockIndexedDb.subscribe.mockImplementation(async function* (table) {
      switch (table) {
        case 'SWAPS':
          // Incoming swaps with no matches
          yield* createUpdates(table, [
            nonMatchingSwap.toJson(),
            nonMatchingSwap.toJson(),
            nonMatchingSwap.toJson(),
          ]);
          break;
        case 'SPENDABLE_NOTES':
          // Incoming notes with the last one being the match
          yield* createUpdates(table, [
            nonMatchingNote.toJson(),
            matchingNoteNotSpent.toJson(),
            matchingNoteSpent.toJson(),
          ]);
          break;
        default:
          expect.unreachable(`Test should not subscribe to ${table}`);
      }
    });

    const req = new NullifierStatusRequest({
      nullifier: matchingNullifier,
      awaitDetection: true,
    });

    const res = await nullifierStatus(req, mockCtx);
    expect(res.spent).toBe(true);
  });

  test('await detect corresponding swap', async () => {
    mockIndexedDb.getSpendableNoteByNullifier.mockResolvedValue(undefined);
    mockIndexedDb.getSwapByNullifier.mockResolvedValue(undefined);

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

    const nonMatchingNote = new SpendableNoteRecord({
      nullifier: new Nullifier({ inner: stringToUint8Array('nope') }),
    });

    mockIndexedDb.subscribe.mockImplementation(async function* (table) {
      switch (table) {
        case 'SPENDABLE_NOTES':
          yield* createUpdates(table, [
            // Incoming notes with no matches
            nonMatchingNote.toJson(),
            nonMatchingNote.toJson(),
            nonMatchingNote.toJson(),
            nonMatchingNote.toJson(),
          ]);
          break;
        case 'SWAPS':
          // Incoming swaps with the last one being the match
          yield* createUpdates(table, [
            nonMatchingSwap.toJson(),
            matchingSwapNotSpent.toJson(),
            matchingSwapSpent.toJson(),
          ]);
          break;
        default:
          expect.unreachable(`Test should not subscribe to ${table}`);
      }
    });

    const req = new NullifierStatusRequest({
      nullifier: matchingNullifier,
      awaitDetection: true,
    });

    const res = await nullifierStatus(req, mockCtx);
    expect(res.spent).toBe(true);
  });
});
