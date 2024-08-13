import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  NotesForVotingRequest,
  NotesForVotingResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import { servicesCtx } from '../ctx/prax.js';
import { IndexedDbMock, MockServices } from '../test-utils.js';
import { notesForVoting } from './notes-for-voting.js';
import type { ServicesInterface } from '@penumbra-zone/types/services';

describe('NotesForVoting request handler', () => {
  let mockServices: MockServices;
  let mockIndexedDb: IndexedDbMock;
  let mockCtx: HandlerContext;

  beforeEach(() => {
    vi.resetAllMocks();

    mockIndexedDb = {
      getNotesForVoting: vi.fn(),
    };
    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({ indexedDb: mockIndexedDb }),
      ) as MockServices['getWalletServices'],
    };
    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.notesForVoting,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(servicesCtx, () =>
        Promise.resolve(mockServices as unknown as ServicesInterface),
      ),
    });
  });

  test('should successfully get notes for voting', async () => {
    mockIndexedDb.getNotesForVoting?.mockResolvedValueOnce(testData);
    const responses: NotesForVotingResponse[] = [];
    const req = new NotesForVotingRequest({});
    for await (const res of notesForVoting(req, mockCtx)) {
      responses.push(new NotesForVotingResponse(res));
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
