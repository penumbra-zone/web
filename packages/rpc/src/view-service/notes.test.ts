import { notes } from './notes';

import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { servicesCtx } from '../ctx/prax';

import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import {
  NotesRequest,
  NotesResponse,
  SpendableNoteRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { IndexedDbMock, MockServices } from '../test-utils';
import { Services } from '@penumbra-zone/services/src/index';

describe('Notes request handler', () => {
  let mockServices: MockServices;
  let mockCtx: HandlerContext;
  let mockIndexedDb: IndexedDbMock;

  beforeEach(() => {
    vi.resetAllMocks();

    const mockIterateSpendableNotes = {
      next: vi.fn(),
      [Symbol.asyncIterator]: () => mockIterateSpendableNotes,
    };

    mockIndexedDb = {
      iterateSpendableNotes: () => mockIterateSpendableNotes,
    };

    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({ indexedDb: mockIndexedDb }),
      ) as MockServices['getWalletServices'],
    };

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.notes,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(servicesCtx, mockServices as unknown as Services),
    });

    for (const record of testData) {
      mockIterateSpendableNotes.next.mockResolvedValueOnce({
        value: record,
      });
    }
    mockIterateSpendableNotes.next.mockResolvedValueOnce({
      done: true,
    });
  });

  test('should get all unspent notes if the query is empty', async () => {
    const responses: NotesResponse[] = [];
    const req = new NotesRequest({});
    for await (const res of notes(req, mockCtx)) {
      responses.push(new NotesResponse(res));
    }
    expect(responses.length).toBe(5);
  });

  test('should get all unspent notes if if includeSpent is false', async () => {
    const responses: NotesResponse[] = [];
    const req = new NotesRequest({
      includeSpent: false,
    });
    for await (const res of notes(req, mockCtx)) {
      responses.push(new NotesResponse(res));
    }
    expect(responses.length).toBe(5);
  });

  test('should get both spent and unspent notes, if includeSpent is true', async () => {
    const responses: NotesResponse[] = [];
    const req = new NotesRequest({
      includeSpent: true,
    });
    for await (const res of notes(req, mockCtx)) {
      responses.push(new NotesResponse(res));
    }
    expect(responses.length).toBe(6);
  });

  test('should get unspent notes with a given assetId', async () => {
    const responses: NotesResponse[] = [];

    const assetId = AssetId.fromJson({
      inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
    });

    const req = new NotesRequest({
      assetId,
    });
    for await (const res of notes(req, mockCtx)) {
      responses.push(new NotesResponse(res));
    }
    expect(responses.length).toBe(4);
  });

  test('should get unspent and spent notes with a given assetId and includeSpent is true', async () => {
    const responses: NotesResponse[] = [];

    const assetId = AssetId.fromJson({
      inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
    });

    const req = new NotesRequest({
      includeSpent: true,
      assetId,
    });
    for await (const res of notes(req, mockCtx)) {
      responses.push(new NotesResponse(res));
    }
    expect(responses.length).toBe(5);
  });

  test('should get unspent and spent notes with a given addressIndex and includeSpent is true', async () => {
    const responses: NotesResponse[] = [];

    const addressIndex = AddressIndex.fromJson({
      account: 99,
      randomizer: 'AAAAAAAAAAAAAAAA',
    });

    const req = new NotesRequest({
      includeSpent: true,
      addressIndex,
    });
    for await (const res of notes(req, mockCtx)) {
      responses.push(new NotesResponse(res));
    }
    expect(responses.length).toBe(1);
  });

  test('should get unspent notes with a given addressIndex', async () => {
    const responses: NotesResponse[] = [];

    const addressIndex = AddressIndex.fromJson({
      account: 99,
      randomizer: 'AAAAAAAAAAAAAAAA',
    });

    const req = new NotesRequest({
      addressIndex,
    });
    for await (const res of notes(req, mockCtx)) {
      responses.push(new NotesResponse(res));
    }
    expect(responses.length).toBe(0);
  });

  test('should get unspent and spent notes with a given addressIndex and given assetId  and includeSpent is true', async () => {
    const responses: NotesResponse[] = [];

    const addressIndex = AddressIndex.fromJson({
      account: 99,
      randomizer: 'AAAAAAAAAAAAAAAA',
    });
    const assetId = AssetId.fromJson({
      inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
    });

    const req = new NotesRequest({
      includeSpent: true,
      addressIndex,
      assetId,
    });
    for await (const res of notes(req, mockCtx)) {
      responses.push(new NotesResponse(res));
    }
    expect(responses.length).toBe(1);
  });

  test('should get unspent notes with a given addressIndex and given assetId', async () => {
    const responses: NotesResponse[] = [];

    const addressIndex = AddressIndex.fromJson({
      account: 99,
      randomizer: 'AAAAAAAAAAAAAAAA',
    });
    const assetId = AssetId.fromJson({
      inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
    });

    const req = new NotesRequest({
      addressIndex,
      assetId,
    });
    for await (const res of notes(req, mockCtx)) {
      responses.push(new NotesResponse(res));
    }
    expect(responses.length).toBe(0);
  });

  test('should get notes total exceeding the specified amountToSpend given assetId and amountToSpend', async () => {
    const responses: NotesResponse[] = [];

    const assetId = AssetId.fromJson({
      inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
    });

    const amountToSpend = {
      lo: 24000000n,
      ho: 0n,
    };

    const req = new NotesRequest({
      assetId,
      amountToSpend,
    });
    for await (const res of notes(req, mockCtx)) {
      responses.push(new NotesResponse(res));
    }
    expect(responses.length).toBe(2);
  });

  test('should get an empty array when assetId is set and amountToSpend is zero', async () => {
    const responses: NotesResponse[] = [];

    const assetId = AssetId.fromJson({
      inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
    });

    const amountToSpend = {
      lo: 0n,
      ho: 0n,
    };

    const req = new NotesRequest({
      assetId,
      amountToSpend,
    });
    for await (const res of notes(req, mockCtx)) {
      responses.push(new NotesResponse(res));
    }
    expect(responses.length).toBe(1);
  });

  test('should ignore amountToSpend filter when assetId is not set', async () => {
    const responses: NotesResponse[] = [];

    const amountToSpend = {
      lo: 0n,
      ho: 0n,
    };

    const req = new NotesRequest({
      amountToSpend,
    });
    for await (const res of notes(req, mockCtx)) {
      responses.push(new NotesResponse(res));
    }
    expect(responses.length).toBe(5);
  });

  test('should ignore the filter when assetId, amountToSpend are set but includeSpent is true', async () => {
    const responses: NotesResponse[] = [];

    const assetId = AssetId.fromJson({
      inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
    });

    const amountToSpend = {
      lo: 0n,
      ho: 0n,
    };

    const req = new NotesRequest({
      assetId,
      amountToSpend,
      includeSpent: true,
    });

    for await (const res of notes(req, mockCtx)) {
      responses.push(new NotesResponse(res));
    }

    expect(responses.length).toBe(5);
  });
});

const testData: SpendableNoteRecord[] = [
  SpendableNoteRecord.fromJson({
    noteCommitment: {
      inner: 'pXS1k2kvlph+vuk9uhqeoP1mZRc+f526a06/bg3EBwQ=',
    },
    heightSpent: '124342342',
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
      account: 99,
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'fv/wPZDA5L96Woc+Ry2s7u9IrwNxTFjSDYInZj3lRA8=',
    },
    heightCreated: '7197',
    position: '42986962944',
    source: {
      transaction: { id: '3CBS08dM9eLHH45Z9loZciZ9RaG9x1fc26Qnv0lQlto=' },
    },
  }),
  SpendableNoteRecord.fromJson({
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
  }),
  SpendableNoteRecord.fromJson({
    noteCommitment: {
      inner: '2x5KAgUMdC2Gg2aZmj0bZFa5eQv2z9pQlSFfGXcgHQk=',
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
      rseed: 'nUSCddD9pm02FxwlmXBCIx1DMrN7QsQ1Mu4QghmIZzU=',
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
      inner: 'YDmbVyQxPBJbowlAy2R8ThWZTXefTLQVXJ5CPT4sGBE=',
    },
    heightCreated: '7235',
    position: '42989453314',
    source: {
      transaction: {
        id: 'VwplfDTpKBFLavZ252viYuVxl+EYpmlmnuj5w+jm/MU=',
      },
    },
  }),
  SpendableNoteRecord.fromJson({
    noteCommitment: {
      inner: '2x5KAgUMdC2Gg2aZmj0bZFa5eQv2z9pQlSFfGXcgHQk=',
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
      rseed: 'nUSCddD9pm02FxwlmXBCIx1DMrN7QsQ1Mu4QghmIZzU=',
      address: {
        inner:
          '874bHlYDfy3mT57v2bXQWm3SJ7g8LI3cZFKob8J8CfrP2aqVGo6ESrpGScI4t/B2/KgkjhzmAasx8GM1ejNz0J153vD8MBVM9FUZFACzSCg=',
      },
    },
    addressIndex: {
      account: 3,
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'YDmbVyQxPBJbowlAy2R8ThWZTXefTLQVXJ5CPT4sGBE=',
    },
    heightCreated: '7235',
    position: '42989453314',
    source: {
      transaction: {
        id: 'VwplfDTpKBFLavZ252viYuVxl+EYpmlmnuj5w+jm/MU=',
      },
    },
  }),
  SpendableNoteRecord.fromJson({
    noteCommitment: {
      inner: '9ykyJTT1AMzrEdmpeHlLdiKO6Atrzrw4UBHsy6uwyAE=',
    },
    note: {
      value: {
        amount: {
          lo: '976000000',
        },
        assetId: {
          inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
        },
      },
      rseed: 'NV9zekY5a2HOqIiHUQxpeuZJnmJwk4UDrcf+Qn4gR1U=',
      address: {
        inner:
          'r7ae/+8Q9d3QdaAs66/GAAbYBo/Am59nYWeIBU7REchE3LYtFPa1EHW2Lo1KZcRWuXzO/cM54CLSFnv2iArQnxjrlJnTB4nGnuLdFtCY9vc=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'xkteBU+VZGL5VtGGCXiF8FNTk11s+26O150ak5YKawc=',
    },
    heightCreated: '7614',
    position: '47262138369',
    source: {
      transaction: {
        id: 'eD/vckPCdUQ19vXeJP0nSBcBPD5hm7mpgfYXOe4NbMI=',
      },
    },
  }),
  SpendableNoteRecord.fromJson({
    noteCommitment: {
      inner: '1hzgmsvqLjwE8oUKqwjvjioP/NjBw7gA559qH1vXfAs=',
    },
    note: {
      value: {
        amount: {
          lo: '1001882102603448320',
          hi: '27105',
        },
        assetId: {
          inner: 'reum7wQmk/owgvGMWMZn/6RFPV24zIKq3W6In/WwZgg=',
        },
      },
      rseed: '78CYHBgQbxFq10fZp8KMJTJMv0/W8h/9CG4b+mpbr2M=',
      address: {
        inner:
          'r7ae/+8Q9d3QdaAs66/GAAbYBo/Am59nYWeIBU7REchE3LYtFPa1EHW2Lo1KZcRWuXzO/cM54CLSFnv2iArQnxjrlJnTB4nGnuLdFtCY9vc=',
      },
    },
    addressIndex: {
      randomizer: 'AAAAAAAAAAAAAAAA',
    },
    nullifier: {
      inner: 'xsqQgf4xVTer74FonmkgkjC1VVaV0OlGKkBt9zKGggM=',
    },
    position: '20',
    source: {
      transaction: {
        id: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAA=',
      },
    },
  }),
];
