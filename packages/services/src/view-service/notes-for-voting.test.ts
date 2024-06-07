import {
  NotesForVotingRequest,
  NotesForVotingResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { HandlerContext, createContextValues, createHandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { idbCtx } from '../ctx/prax';
import { IndexedDbMock } from '../test-utils';
import { notesForVoting } from './notes-for-voting';

describe('NotesForVoting request handler', () => {
  let mockIndexedDb: IndexedDbMock;
  let mockCtx: HandlerContext;

  beforeEach(() => {
    vi.resetAllMocks();

    mockIndexedDb = {
      getNotesForVoting: vi.fn(),
    };

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.notesForVoting,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(idbCtx, () =>
        Promise.resolve(mockIndexedDb as unknown),
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
