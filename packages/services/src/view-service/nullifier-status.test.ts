import { nullifierStatus } from './nullifier-status';

import { ViewService } from '@penumbra-zone/protobuf';

import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { Nullifier } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1/sct_pb';
import {
  NullifierStatusRequest,
  SpendableNoteRecord,
  SwapRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';

import { stringToUint8Array } from '@penumbra-zone/types/string';
import { dbCtx } from '../ctx/database';
import { DatabaseCtx } from '../ctx/database';
import { mockIndexedDb } from '../test-utils';

describe('nullifierStatus', () => {
  let mockCtx: HandlerContext;

  beforeEach(() => {
    vi.resetAllMocks();

    mockIndexedDb.subscribeSpendableNoteRecords.mockImplementation(async function* () {
      for await (const record of []) {
        yield record;
      }
    });
    mockIndexedDb.subscribeSwapRecords.mockImplementation(async function* () {
      for await (const record of []) {
        yield record;
      }
    });

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.nullifierStatus,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(dbCtx, () =>
        Promise.resolve(mockIndexedDb as unknown as DatabaseCtx),
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

    // Incoming swaps with no matches
    mockIndexedDb.subscribeSwapRecords.mockImplementation(async function* () {
      yield* await Promise.resolve([
        nonMatchingSwap,
        nonMatchingSwap,
        nonMatchingSwap,
        nonMatchingSwap,
      ]);
    });

    // Incoming notes with the last one being the match

    mockIndexedDb.subscribeSpendableNoteRecords.mockImplementation(async function* () {
      yield* [nonMatchingNote, matchingNoteNotSpent, matchingNoteSpent, nonMatchingNote];
      yield await new Promise<SpendableNoteRecord>(() => null);
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

    // Incoming swaps with the last one being the match
    mockIndexedDb.subscribeSwapRecords.mockImplementation(async function* () {
      yield* await Promise.resolve([nonMatchingSwap, matchingSwapNotSpent, matchingSwapSpent]);
    });

    const nonMatchingNote = new SpendableNoteRecord({
      nullifier: new Nullifier({ inner: stringToUint8Array('nope') }),
    });

    // Incoming notes with no matches
    mockIndexedDb.subscribeSpendableNoteRecords.mockImplementation(async function* () {
      yield* await Promise.resolve([
        nonMatchingNote,
        nonMatchingNote,
        nonMatchingNote,
        nonMatchingNote,
      ]);
    });

    const req = new NullifierStatusRequest({
      nullifier: matchingNullifier,
      awaitDetection: true,
    });

    const res = await nullifierStatus(req, mockCtx);
    expect(res.spent).toBe(true);
  });
});
