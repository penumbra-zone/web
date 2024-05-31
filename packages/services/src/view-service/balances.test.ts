import { servicesCtx } from '../ctx/prax';
import { balances } from './balances';

import { ViewService } from '@penumbra-zone/protobuf';

import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import {
  BalancesRequest,
  BalancesResponse,
  SpendableNoteRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';

import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { ServicesInterface } from '@penumbra-zone/types/services';
import { IndexedDbMock, MockServices, TendermintMock, testFullViewingKey } from '../test-utils';
import {
  AssetId,
  EquivalentValue,
  EstimatedPrice,
  Metadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import {
  getAmount,
  getAssetIdFromValueView,
  getEquivalentValues,
  getMetadata,
} from '@penumbra-zone/getters/value-view';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { base64ToUint8Array } from '@penumbra-zone/types/base64';
import { multiplyAmountByNumber } from '@penumbra-zone/types/amount';
import { fvkCtx } from '../ctx/full-viewing-key';

const assertOnlyUniqueAssetIds = (responses: BalancesResponse[], accountId: number) => {
  const account0Res = responses.filter(
    r => getAddressIndex(r.accountAddress).account === accountId,
  );
  const uniqueAssetIds = account0Res.reduce((collection, res) => {
    collection.add(getAssetIdFromValueView(res.balanceView));
    return collection;
  }, new Set());

  expect(account0Res.length).toBe(uniqueAssetIds.size);
};

describe('Balances request handler', () => {
  let req: BalancesRequest;
  let mockServices: MockServices;
  let mockCtx: HandlerContext;
  let mockIndexedDb: IndexedDbMock;
  let mockTendermint: TendermintMock;

  beforeEach(() => {
    vi.resetAllMocks();

    const mockIterateSpendableNotes = {
      next: vi.fn(),
      [Symbol.asyncIterator]: () => mockIterateSpendableNotes,
    };

    mockIndexedDb = {
      getAssetsMetadata: vi.fn(),
      getPricesForAsset: vi.fn(),
      iterateSpendableNotes: () => mockIterateSpendableNotes,
    };

    const mockShieldedPool = {
      assetMetadata: vi.fn(),
    };

    mockTendermint = {
      latestBlockHeight: vi.fn(),
    };

    mockServices = {
      // @ts-expect-error TODO: Improve mocking types
      getWalletServices: vi.fn(() =>
        Promise.resolve({
          indexedDb: mockIndexedDb,
          querier: {
            shieldedPool: mockShieldedPool,
            tendermint: mockTendermint,
          },
        }),
      ) as MockServices['getWalletServices'],
    };

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.balances,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues()
        .set(servicesCtx, () => Promise.resolve(mockServices as unknown as ServicesInterface))
        .set(fvkCtx, () => Promise.resolve(testFullViewingKey)),
    });

    for (const record of testData) {
      mockIterateSpendableNotes.next.mockResolvedValueOnce({
        value: record,
      });
    }
    mockIterateSpendableNotes.next.mockResolvedValueOnce({
      done: true,
    });

    mockIndexedDb.getAssetsMetadata?.mockImplementation((assetId: AssetId) => {
      return Promise.resolve(
        new Metadata({
          penumbraAssetId: assetId,
        }),
      );
    });

    mockIndexedDb.getPricesForAsset?.mockImplementation(() => Promise.resolve([]));
    req = new BalancesRequest();
  });

  test('aggregation, with no filtering', async () => {
    const responses: BalancesResponse[] = [];
    for await (const res of balances(req, mockCtx)) {
      responses.push(new BalancesResponse(res));
    }
    expect(responses.length).toBe(4);
    assertOnlyUniqueAssetIds(responses, 0);
    assertOnlyUniqueAssetIds(responses, 1);
    assertOnlyUniqueAssetIds(responses, 2);
    assertOnlyUniqueAssetIds(responses, 3);
  });

  test('filtering asset id', async () => {
    const assetId = new AssetId({
      inner: base64ToUint8Array('KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA='),
    });
    req.assetIdFilter = assetId;
    const responses: BalancesResponse[] = [];
    for await (const res of balances(req, mockCtx)) {
      responses.push(new BalancesResponse(res));
    }
    expect(responses.length).toBe(3);
    responses.forEach(r => {
      expect(getMetadata(r.balanceView).penumbraAssetId?.equals(assetId)).toBeTruthy();
    });
  });

  test('filtering account', async () => {
    req.accountFilter = new AddressIndex({ account: 12 });
    const responses: BalancesResponse[] = [];
    for await (const res of balances(req, mockCtx)) {
      responses.push(new BalancesResponse(res));
    }
    expect(responses.length).toBe(1);
    responses.forEach(r => {
      expect(getAddressIndex(r.accountAddress).account).toBe(12);
    });
  });

  test('spent notes', async () => {
    req.accountFilter = new AddressIndex({ account: 99 });
    const responses: BalancesResponse[] = [];
    for await (const res of balances(req, mockCtx)) {
      responses.push(new BalancesResponse(res));
    }
    expect(responses.length).toBe(0);
  });

  test('equivalent values', async () => {
    expect.assertions(3);

    const numeraire = new AssetId({ inner: new Uint8Array([1, 2, 3, 4]) });
    const pricedAsset = new AssetId({ inner: new Uint8Array([5, 6, 7, 8]) });
    const mockNumerairePerUnit = 2.5;

    // We'll just mock the same response for every call -- we're just testing
    // that the equivalent prices get included in the RPC response.
    mockIndexedDb.getPricesForAsset?.mockResolvedValue([
      new EstimatedPrice({
        asOfHeight: 123n,
        numerairePerUnit: mockNumerairePerUnit,
        numeraire,
        pricedAsset,
      }),
    ]);

    const assetId = new AssetId({
      inner: base64ToUint8Array('KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA='),
    });
    req.assetIdFilter = assetId;

    for await (const res of balances(req, mockCtx)) {
      const response = new BalancesResponse(res);
      const amount = getAmount(response.balanceView);
      const equivalentAmount = multiplyAmountByNumber(amount, mockNumerairePerUnit);

      expect(getEquivalentValues(response.balanceView)).toEqual([
        new EquivalentValue({
          asOfHeight: 123n,
          numeraire: { penumbraAssetId: numeraire },
          equivalentAmount,
        }),
      ]);
    }
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
