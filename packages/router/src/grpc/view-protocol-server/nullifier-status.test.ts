import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import { handleNullifierStatusReq } from './nullifier-status';
import {
  NullifierStatusRequest,
  SpendableNoteRecord,
  SwapRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ServicesInterface, stringToUint8Array } from '@penumbra-zone/types';
import { WalletId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { Nullifier } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1alpha1/sct_pb';
import { assertWalletIdMatches } from './utils';

const mockAssertWalletId = assertWalletIdMatches as Mock;

vi.mock('./utils', () => ({
  assertWalletIdMatches: vi.fn(() => Promise.resolve(true)),
}));

interface IndexedDbMock {
  getNoteByNullifier: Mock;
  getSwapByNullifier: Mock;
  subscribe: (table: string) => { next: Mock };
}

interface MockServices {
  getWalletServices: Mock<[], Promise<{ indexedDb: IndexedDbMock }>>;
}

describe('handleNullifierStatusReq', () => {
  let mockServices: MockServices;
  let mockIndexedDb: IndexedDbMock;
  let noteSubNext: Mock;
  let swapSubNext: Mock;

  beforeEach(() => {
    vi.resetAllMocks();

    noteSubNext = vi.fn();
    const mockNoteSubscription = {
      next: noteSubNext,
    };

    swapSubNext = vi.fn();
    const mockSwapSubscription = {
      next: swapSubNext,
    };

    mockIndexedDb = {
      getNoteByNullifier: vi.fn(),
      getSwapByNullifier: vi.fn(),
      subscribe: (table: string) => {
        if (table === 'SPENDABLE_NOTES') return mockNoteSubscription;
        if (table === 'SWAPS') return mockSwapSubscription;
        throw new Error('Table not supported');
      },
    };
    mockServices = {
      getWalletServices: vi.fn(() => Promise.resolve({ indexedDb: mockIndexedDb })),
    };
  });

  test('throws if wallet id is passed and does not match', async () => {
    const error = 'wallet id does not match';
    mockAssertWalletId.mockRejectedValue(error);

    const req = new NullifierStatusRequest({
      walletId: new WalletId({ inner: stringToUint8Array('xyz') }),
    });

    await expect(
      handleNullifierStatusReq(req, mockServices as unknown as ServicesInterface),
    ).rejects.toThrowError(error);
  });

  test('returns empty response if no nullifier provided', async () => {
    const req = new NullifierStatusRequest();
    await expect(
      handleNullifierStatusReq(req, mockServices as unknown as ServicesInterface),
    ).rejects.toThrowError('No nullifier passed');
  });

  test('returns false if nullifier not found in db', async () => {
    const req = new NullifierStatusRequest({
      nullifier: new Nullifier({ inner: stringToUint8Array('nullifier_abc') }),
    });

    mockIndexedDb.getNoteByNullifier.mockResolvedValue(undefined);
    mockIndexedDb.getSwapByNullifier.mockResolvedValue(undefined);

    const res = await handleNullifierStatusReq(req, mockServices as unknown as ServicesInterface);
    expect(res.spent).toBe(false);
  });

  test('returns true if nullifier found in swaps and is spent', async () => {
    const req = new NullifierStatusRequest({
      nullifier: new Nullifier({ inner: stringToUint8Array('nullifier_abc') }),
    });

    mockIndexedDb.getNoteByNullifier.mockResolvedValue(undefined);
    mockIndexedDb.getSwapByNullifier.mockResolvedValue(new SwapRecord({ heightClaimed: 324234n }));

    const res = await handleNullifierStatusReq(req, mockServices as unknown as ServicesInterface);
    expect(res.spent).toBe(true);
  });

  test('returns false if nullifier found in swaps and is not spent', async () => {
    const req = new NullifierStatusRequest({
      nullifier: new Nullifier({ inner: stringToUint8Array('nullifier_abc') }),
    });

    mockIndexedDb.getNoteByNullifier.mockResolvedValue(undefined);
    mockIndexedDb.getSwapByNullifier.mockResolvedValue(new SwapRecord());

    const res = await handleNullifierStatusReq(req, mockServices as unknown as ServicesInterface);
    expect(res.spent).toBe(false);
  });

  test('returns true if nullifier found in notes and is spent', async () => {
    const req = new NullifierStatusRequest({
      nullifier: new Nullifier({ inner: stringToUint8Array('nullifier_abc') }),
    });

    mockIndexedDb.getNoteByNullifier.mockResolvedValue(
      new SpendableNoteRecord({ heightSpent: 324234n }),
    );
    mockIndexedDb.getSwapByNullifier.mockResolvedValue(undefined);

    const res = await handleNullifierStatusReq(req, mockServices as unknown as ServicesInterface);
    expect(res.spent).toBe(true);
  });

  test('returns false if nullifier found in notes and is not spent', async () => {
    const req = new NullifierStatusRequest({
      nullifier: new Nullifier({ inner: stringToUint8Array('nullifier_abc') }),
    });

    mockIndexedDb.getNoteByNullifier.mockResolvedValue(new SpendableNoteRecord());
    mockIndexedDb.getSwapByNullifier.mockResolvedValue(undefined);

    const res = await handleNullifierStatusReq(req, mockServices as unknown as ServicesInterface);
    expect(res.spent).toBe(false);
  });

  test('await detect corresponding note', async () => {
    mockIndexedDb.getNoteByNullifier.mockResolvedValue(undefined);
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

    const res = await handleNullifierStatusReq(req, mockServices as unknown as ServicesInterface);
    expect(res.spent).toBe(true);
  });

  test('await detect corresponding swap', async () => {
    mockIndexedDb.getNoteByNullifier.mockResolvedValue(undefined);
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

    // Incoming notes with no matches
    noteSubNext.mockImplementation(() => new Promise(() => undefined));

    const req = new NullifierStatusRequest({
      nullifier: matchingNullifier,
      awaitDetection: true,
    });

    const res = await handleNullifierStatusReq(req, mockServices as unknown as ServicesInterface);
    expect(res.spent).toBe(true);
  });
});
