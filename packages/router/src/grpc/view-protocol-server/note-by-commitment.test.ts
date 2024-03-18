import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import {
  NoteByCommitmentRequest,
  NoteByCommitmentResponse,
  SpendableNoteRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { servicesCtx } from '../../ctx/prax';
import { IndexedDbMock, MockServices } from '../test-utils';
import { StateCommitment } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/crypto/tct/v1/tct_pb';
import { noteByCommitment } from './note-by-commitment';
import type { ServicesInterface } from '@penumbra-zone/types/src/services';

describe('NoteByCommitment request handler', () => {
  let mockServices: MockServices;
  let mockIndexedDb: IndexedDbMock;
  let mockCtx: HandlerContext;
  let request: NoteByCommitmentRequest;
  let noteSubNext: Mock;

  beforeEach(() => {
    vi.resetAllMocks();

    noteSubNext = vi.fn();
    const mockNoteSubscription = {
      next: noteSubNext,
      [Symbol.asyncIterator]: () => mockNoteSubscription,
    };

    mockIndexedDb = {
      getSpendableNoteByCommitment: vi.fn(),
      subscribe: () => mockNoteSubscription,
    };
    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({ indexedDb: mockIndexedDb }),
      ) as MockServices['getWalletServices'],
    };
    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.noteByCommitment,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(
        servicesCtx,
        mockServices as unknown as ServicesInterface,
      ),
    });

    request = new NoteByCommitmentRequest({ noteCommitment: testCommitment });
  });

  test('should successfully get note by commitment when idb has them', async () => {
    mockIndexedDb.getSpendableNoteByCommitment?.mockResolvedValue(testNote);
    const noteByCommitmentResponse = new NoteByCommitmentResponse(
      await noteByCommitment(request, mockCtx),
    );
    expect(noteByCommitmentResponse.spendableNote?.equals(testNote)).toBeTruthy();
  });

  test('should throw error if commitment is missing in request', async () => {
    await expect(noteByCommitment(new NoteByCommitmentRequest(), mockCtx)).rejects.toThrow(
      'Missing note commitment in request',
    );
  });

  test('should throw an error if note  no found in idb and awaitDetection is false', async () => {
    mockIndexedDb.getSpendableNoteByCommitment?.mockResolvedValue(undefined);
    request.awaitDetection = false;
    await expect(noteByCommitment(request, mockCtx)).rejects.toThrow('Note not found');
  });

  test('should get note if note is not found in idb, but awaitDetection is true, and has been detected', async () => {
    mockIndexedDb.getSpendableNoteByCommitment?.mockResolvedValue(undefined);
    request.awaitDetection = true;
    noteSubNext.mockResolvedValueOnce({
      value: { value: testNote.toJson() },
    });
    const noteByCommitmentResponse = new NoteByCommitmentResponse(
      await noteByCommitment(request, mockCtx),
    );
    expect(noteByCommitmentResponse.spendableNote?.equals(testNote)).toBeTruthy();
  });

  test('should throw error if note is not found in idb, and has not been detected', async () => {
    mockIndexedDb.getSpendableNoteByCommitment?.mockResolvedValue(undefined);
    request.awaitDetection = true;

    noteSubNext.mockResolvedValueOnce({
      value: { value: noteWithAnotherCommitment.toJson() },
    });
    noteSubNext.mockResolvedValueOnce({
      done: true,
    });
    await expect(noteByCommitment(request, mockCtx)).rejects.toThrow('Note not found');
  });
});

const testCommitment = StateCommitment.fromJson({
  inner: 'pXS1k2kvlph+vuk9uhqeoP1mZRc+f526a06/bg3EBwQ=',
});

const testNote = SpendableNoteRecord.fromJson({
  noteCommitment: {
    inner: 'pXS1k2kvlph+vuk9uhqeoP1mZRc+f526a06/bg3EBwQ=',
  },
  note: {
    value: {
      amount: {
        lo: '12000000',
      },
      assetId: {
        inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
      },
    },
    rseed: 'h04XyitXpY1Q77M+vSzPauf4ZPx9NNRBAuUcVqP6pWo=',
    address: {
      inner:
        '874bHlYDfy3mT57v2bXQWm3SJ7g8LI3cZFKob8J8CfrP2aqVGo6ESrpGScI4t/B2/KgkjhzmAasx8GM1ejNz0J153vD8MBVM9FUZFACzSCg=',
    },
  },
  addressIndex: {
    account: 12,
    randomizer: 'AAAAAAAAAAAAAAAA',
  },
  nullifier: {
    inner: 'fv/wPZDA5L96Woc+Ry2s7u9IrwNxTFjSDYInZj3lRA8=',
  },
  heightCreated: '7197',
  position: '42986962944',
  source: {
    transaction: {
      id: '3CBS08dM9eLHH45Z9loZciZ9RaG9x1fc26Qnv0lQlto=',
    },
  },
});

const noteWithAnotherCommitment = SpendableNoteRecord.fromJson({
  noteCommitment: {
    inner: '2x5KAgUMdC2Gg2aZmj0bZFa5eQv2z9pQlSFfGXcgHQk=',
  },
});
