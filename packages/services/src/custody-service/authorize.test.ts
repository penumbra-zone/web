import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { servicesCtx } from '../ctx/prax.js';
import { testFullViewingKey, testSpendKey } from '../test-utils.js';
import { authorize } from './authorize.js';
import {
  AuthorizeRequest,
  AuthorizeResponse,
} from '@penumbra-zone/protobuf/penumbra/custody/v1/custody_pb';
import { CustodyService } from '@penumbra-zone/protobuf';
import {
  AuthorizationData,
  TransactionPlan,
} from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import type { ServicesInterface } from '@penumbra-zone/types/services';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { fvkCtx } from '../ctx/full-viewing-key.js';
import { authorizeCtx } from '../ctx/authorize.js';
import { authorizePlan } from '@penumbra-zone/wasm/build';

describe('Authorize request handler', () => {
  let req: AuthorizeRequest;

  const mockFullViewingKeyCtx = vi.fn(() => Promise.resolve(testFullViewingKey));
  const mockAuthorizeCtx = vi.fn(({ plan }: AuthorizeRequest) =>
    Promise.resolve(new AuthorizeResponse({ data: authorizePlan(testSpendKey, plan!) })),
  );
  const mockServicesCtx: Mock<[], Promise<ServicesInterface>> = vi.fn();

  const handlerContextInit = {
    service: CustodyService,
    method: CustodyService.methods.authorize,
    protocolName: 'mock',
    requestMethod: 'MOCK',
    url: '/mock',
  };

  const contextValues = createContextValues()
    .set(servicesCtx, mockServicesCtx)
    .set(fvkCtx, mockFullViewingKeyCtx)
    .set(authorizeCtx, mockAuthorizeCtx);

  const mockCtx: HandlerContext = createHandlerContext({
    ...handlerContextInit,
    contextValues,
  });

  beforeEach(() => {
    const mockIterateMetadata = {
      next: vi.fn(),
      [Symbol.asyncIterator]: () => mockIterateMetadata,
    };

    mockServicesCtx.mockResolvedValue({
      getWalletServices: () =>
        Promise.resolve({
          indexedDb: {
            iterateAssetsMetadata: () => mockIterateMetadata,
          },
        }),
    } as unknown as ServicesInterface);

    for (const record of testAssetsMetadata) {
      mockIterateMetadata.next.mockResolvedValue({
        value: record,
      });
    }
    mockIterateMetadata.next.mockResolvedValue({
      done: true,
    });

    req = new AuthorizeRequest({ plan: testTxPlanData });
  });

  test('should successfully authorize request', async () => {
    const authData = authorize(req, mockCtx);
    await expect(authData).resolves.toHaveProperty('data');
    const { data } = await authData;
    expect(data).toBeInstanceOf(AuthorizationData);
  });

  test('should fail if context does not authorize', async () => {
    mockAuthorizeCtx.mockRejectedValueOnce(new Error('no'));
    await expect(authorize(req, mockCtx)).rejects.toThrow('no');
  });

  test('should fail if plan is missing in request', async () => {
    await expect(authorize(new AuthorizeRequest(), mockCtx)).rejects.toThrow(
      'No plan included in request',
    );
  });
});

const testTxPlanData = TransactionPlan.fromJson({
  actions: [
    {
      output: {
        value: {
          amount: {
            lo: '2000000',
          },
          assetId: {
            inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
          },
        },
        destAddress: {
          inner:
            '0AI1VPl2Z2iM62nnBX+o00kL3Fcvcqm8zgp0ErDpw4hT2syB5TeaGJM8B+5KV+/3CS78toGM3WleoNgPh/7L9bKNOrmq7UEqBmfAb7MDI+w=',
        },
        rseed: 'BULXqsGKMksW5MfrJAuWWWaEHJw36avj90y+/TzDspk=',
        valueBlinding: 'DMAmhhWllwK84CFBGY5OPkkCLP1pRNhyK0OzotdAnwE=',
        proofBlindingR: 'doF1SnSllGyEqWWsmEIiHlCnDG9M083qjeyFNHW9agc=',
        proofBlindingS: 'uRcVB0ZoUWPDrNA0wfznHJ6Wfn3usDCgazIDkLmZIQE=',
      },
    },
    {
      spend: {
        note: {
          value: {
            amount: {
              lo: '999970000000',
            },
            assetId: {
              inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
            },
          },
          rseed: 's8BBrPg6NNLttLZfg7Ban2LOyqyt3IxpBFK9MmpHvKQ=',
          address: {
            inner:
              'H54tVYCe2KONaws0+4Qt8jHSup2InYWauNEGtLa7+yQ8ssaP1Qc2bjsB7uyfQl3QKMXzfm3u70/CbK9tOiSXjDtDzx3AtQw2wKCeuht3Ono=',
          },
        },
        position: '34395652097',
        randomizer: '6cyFYGqAzvV4mMwsmZBAwELPUv1ZGFcY8f+X07zgtgI=',
        valueBlinding: '7EMBCEOyvPGDAuqRqivIdVVPgIV2NCLwin3n5pQqXgA=',
        proofBlindingR: '5lN3tTp7HwVcMwftb/YPIv5zfVP6CdmjlCEjQcPzGQo=',
        proofBlindingS: 'JFvqR0FInc0EqgmnhZmUVbsbnxz6dKoSkgheGAjZYQI=',
      },
    },
    {
      output: {
        value: {
          amount: {
            lo: '999968000000',
          },
          assetId: {
            inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
          },
        },
        destAddress: {
          inner:
            'H54tVYCe2KONaws0+4Qt8jHSup2InYWauNEGtLa7+yQ8ssaP1Qc2bjsB7uyfQl3QKMXzfm3u70/CbK9tOiSXjDtDzx3AtQw2wKCeuht3Ono=',
        },
        rseed: 'gYyyrY8TsRvUNKIdP1YCpJp/Eu/s0e07zCtn7hN5GEU=',
        valueBlinding: 'X+GBy22M8nw96admaf73HSHfwQV6kY1h+hwtxyv43gM=',
        proofBlindingR: 'x8nvKsa9z4sLwwvPTsJPzeUGXjYc+io6jlj9sHCAIQ4=',
        proofBlindingS: 'cwonvYBvfGCke2uMZOCOqFXQ1xWGdQxmGmnUyRSa0wk=',
      },
    },
  ],
  transactionParameters: {
    chainId: 'penumbra-testnet-deimos-4-a9b11fc4',
    fee: {
      amount: {},
    },
  },
  detectionData: {
    cluePlans: [
      {
        address: {
          inner:
            '0AI1VPl2Z2iM62nnBX+o00kL3Fcvcqm8zgp0ErDpw4hT2syB5TeaGJM8B+5KV+/3CS78toGM3WleoNgPh/7L9bKNOrmq7UEqBmfAb7MDI+w=',
        },
        rseed: '2lahgt65yDWXPfLS/rvs8pdvLVQ8czd3XBYmJTIWsCg=',
      },
      {
        address: {
          inner:
            'H54tVYCe2KONaws0+4Qt8jHSup2InYWauNEGtLa7+yQ8ssaP1Qc2bjsB7uyfQl3QKMXzfm3u70/CbK9tOiSXjDtDzx3AtQw2wKCeuht3Ono=',
        },
        rseed: 'IG3MCsS8gtTOrqaOTWxkAKHAnFTgYEKsd9rsvsUuGFQ=',
      },
    ],
  },
  memo: {
    plaintext: {
      returnAddress: {
        inner:
          'H54tVYCe2KONaws0+4Qt8jHSup2InYWauNEGtLa7+yQ8ssaP1Qc2bjsB7uyfQl3QKMXzfm3u70/CbK9tOiSXjDtDzx3AtQw2wKCeuht3Ono=',
      },
      text: 'Authorize test',
    },
    key: 'oEBs1HP1bMgskLja5CAuFMpRM1Xw6IScIbBXJKzRJgc=',
  },
});

const testAssetsMetadata = [
  Metadata.fromJson({
    description: '',
    denomUnits: [
      { denom: 'penumbra', exponent: 6, aliases: [] },
      { denom: 'mpenumbra', exponent: 3, aliases: [] },
      { denom: 'upenumbra', exponent: 0, aliases: [] },
    ],
    base: 'upenumbra',
    display: 'penumbra',
    name: '',
    symbol: '',
    penumbraAssetId: {
      inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
    },
  }),
];
