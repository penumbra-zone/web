import { beforeEach, describe, expect, test, vi } from 'vitest';
import { TournamentVotesRequest } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import { servicesCtx } from '../ctx/prax.js';
import { IndexedDbMock, MockServices } from '../test-utils.js';
import type { ServicesInterface } from '@penumbra-zone/types/services';
import { Epoch } from '@penumbra-zone/protobuf/penumbra/core/component/sct/v1/sct_pb';
import { tournamentVotes } from './tournament-votes.js';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { Value } from '@bufbuild/protobuf';

describe('tournamentVotes request handler', () => {
  let mockServices: MockServices;
  let mockIndexedDb: IndexedDbMock;
  let mockCtx: HandlerContext;

  beforeEach(() => {
    vi.resetAllMocks();

    mockIndexedDb = {
      getLQTHistoricalVotes: vi.fn(),
      saveLQTHistoricalVote: vi.fn(),
      getBlockHeightByEpoch: vi.fn(),
      getNotesForVoting: vi.fn(),
    };

    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({ indexedDb: mockIndexedDb }),
      ) as MockServices['getWalletServices'],
    };

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.tournamentVotes,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(servicesCtx, () =>
        Promise.resolve(mockServices as unknown as ServicesInterface),
      ),
    });
  });

  test('returns historical liquidity tournament votes that have been previously been saved to storage', async () => {
    mockIndexedDb.getBlockHeightByEpoch?.mockResolvedValueOnce(epoch);
    mockIndexedDb.saveLQTHistoricalVote?.mockResolvedValueOnce(mockVote);
    mockIndexedDb.getLQTHistoricalVotes?.mockResolvedValueOnce(mockVote);

    const req = new TournamentVotesRequest({});
    const vote = await tournamentVotes(req, mockCtx);

    expect(vote.votes?.length).toBe(1);
  });
});

const epoch = new Epoch({
  index: 100n,
  startHeight: 5000n,
});

const mockVote = {
  TransactionId: {
    inner: new Uint8Array([1, 2, 3, 4]),
  },
  AssetMetadata: {
    penumbraAssetId: {
      inner: new Uint8Array(new Array(32).fill(1)),
    },
  },
  VoteValue: Value.fromJson({
    amount: {
      lo: '1000',
      hi: '0',
    },
  }),
  RewardValue: Amount.fromJson({
    lo: '500',
    hi: '0',
  }),
};
