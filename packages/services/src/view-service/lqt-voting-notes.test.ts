import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  LqtVotingNotesRequest,
  LqtVotingNotesResponse,
  NotesForVotingResponse,
  SpendableNoteRecord,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import { servicesCtx } from '../ctx/prax.js';
import { IndexedDbMock, MockQuerier, MockServices } from '../test-utils.js';
import type { ServicesInterface } from '@penumbra-zone/types/services';
import { lqtVotingNotes } from './lqt-voting-notes.js';
import { Epoch } from '@penumbra-zone/protobuf/penumbra/core/component/sct/v1/sct_pb';
import { LqtCheckNullifierResponse } from '@penumbra-zone/protobuf/penumbra/core/component/funding/v1/funding_pb';
import { TransactionId } from '@penumbra-zone/protobuf/penumbra/core/txhash/v1/txhash_pb';

describe('lqtVotingNotes request handler', () => {
  let mockServices: MockServices;
  let mockIndexedDb: IndexedDbMock;
  let mockQuerier: MockQuerier;
  let mockCtx: HandlerContext;

  beforeEach(() => {
    vi.resetAllMocks();

    mockIndexedDb = {
      getLQTHistoricalVotes: vi.fn(),
      iterateLQTVotes: vi.fn(),
      getEpochByIndex: vi.fn(),
      getNotesForVoting: vi.fn(),
    };

    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({ indexedDb: mockIndexedDb }),
      ) as MockServices['getWalletServices'],
    };

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.lqtVotingNotes,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(servicesCtx, () =>
        Promise.resolve(mockServices as unknown as ServicesInterface),
      ),
    });
  });

  test('returns no voting notes if the nullifier has already been used for voting in the current epoch', async () => {
    // voting notes mocked with static data, and the mock bypasses the logic in the real implementation,
    // but that's fine.
    mockIndexedDb.getNotesForVoting?.mockResolvedValueOnce(testData);
    mockIndexedDb.getEpochByIndex?.mockResolvedValueOnce(epoch);

    mockQuerier = {
      funding: {
        lqtCheckNullifier: vi.fn().mockResolvedValue(
          new LqtCheckNullifierResponse({
            transaction: new TransactionId({
              inner: new Uint8Array([]),
            }),
            alreadyVoted: true,
            epochIndex: 100n,
          }),
        ),
      },
    };

    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({ indexedDb: mockIndexedDb, querier: mockQuerier }),
      ) as MockServices['getWalletServices'],
    };

    const responses: SpendableNoteRecord[] = [];
    const req = new LqtVotingNotesRequest({});
    for await (const { noteRecord, alreadyVoted } of lqtVotingNotes(req, mockCtx)) {
      if (!alreadyVoted) {
        responses.push(noteRecord as SpendableNoteRecord);
      }
    }

    expect(responses.length).toBe(0);
  });

  test('returns voting notes when the nullifier has not been used for voting in the current epoch', async () => {
    mockIndexedDb.getNotesForVoting?.mockResolvedValueOnce(testData);
    mockIndexedDb.getEpochByIndex?.mockResolvedValueOnce(epoch);

    mockQuerier = {
      funding: {
        lqtCheckNullifier: vi.fn().mockResolvedValue(
          new LqtCheckNullifierResponse({
            transaction: new TransactionId({
              inner: new Uint8Array([]),
            }),
            alreadyVoted: false,
            epochIndex: 100n,
          }),
        ),
      },
    };

    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({ indexedDb: mockIndexedDb, querier: mockQuerier }),
      ) as MockServices['getWalletServices'],
    };

    const responses: LqtVotingNotesResponse[] = [];
    const req = new LqtVotingNotesRequest({});
    for await (const res of lqtVotingNotes(req, mockCtx)) {
      responses.push(new LqtVotingNotesResponse(res));
    }

    expect(responses.length).toBe(2);
  });
});

const testData: NotesForVotingResponse[] = [
  NotesForVotingResponse.fromJson({
    noteRecord: {
      noteCommitment: {
        inner: 'pXS1k2kvlph+vuk9uhqeoP1mZRc+f526a06/bg3EBwQ=',
      },
    },
    identityKey: {
      ik: 'VAv+z5ieJk7AcAIJoVIqB6boOj0AhZB2FKWsEidfvAE=',
    },
  }),
  NotesForVotingResponse.fromJson({
    noteRecord: {
      noteCommitment: {
        inner: '2XS1k2kvlph+vuk9uhqeoP1mZRc+f526a06/bg3EBwQ=',
      },
    },
    identityKey: {
      ik: 'pkxdxOn9EMqdjoCJdEGBKA8XY9P9RK9XmurIly/9yBA=',
    },
  }),
];

const epoch = new Epoch({
  index: 100n,
  startHeight: 5000n,
});
