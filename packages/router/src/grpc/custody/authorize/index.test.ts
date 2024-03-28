import { beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { approverCtx } from '../../../ctx/approver';
import { extLocalCtx, extSessionCtx, servicesCtx } from '../../../ctx/prax';
import { IndexedDbMock, MockExtLocalCtx, MockExtSessionCtx, MockServices } from '../../test-utils';
import { authorize } from '.';
import { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1/custody_pb';
import { CustodyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1/custody_connect';
import {
  AuthorizationData,
  TransactionPlan,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { Services } from '@penumbra-zone/services/src/index';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { UserChoice } from '@penumbra-zone/types/src/user-choice';

describe('Authorize request handler', () => {
  let mockServices: MockServices;
  let mockApproverCtx: Mock;
  let mockExtLocalCtx: MockExtLocalCtx;
  let mockExtSessionCtx: MockExtSessionCtx;
  let mockCtx: HandlerContext;
  let req: AuthorizeRequest;

  beforeEach(() => {
    vi.resetAllMocks();

    const mockIterateMetadata = {
      next: vi.fn(),
      [Symbol.asyncIterator]: () => mockIterateMetadata,
    };

    const mockIndexedDb: IndexedDbMock = {
      iterateAssetsMetadata: () => mockIterateMetadata,
    };

    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({ indexedDb: mockIndexedDb, viewServer: { fullViewingKey: 'fvk' } }),
      ) as MockServices['getWalletServices'],
    };

    mockExtLocalCtx = {
      get: vi.fn().mockImplementation((key: string) => {
        if (key === 'wallets') {
          return Promise.resolve([
            {
              custody: {
                encryptedSeedPhrase: {
                  cipherText:
                    'di37XH8dpSbuBN9gwGB6hgAJycWVqozf3UB6O3mKTtimp8DsC0ZZRNEaf1hNi2Eu2pu1dF1f+vHAnisk3W4mRggAVUNtO0gvD8jcM0RhzGVEZnUlZuRR1TtoQDFXzmo=',
                  nonce: 'MUyDW2GHSeZYVF4f',
                },
              },
              fullViewingKey:
                'penumbrafullviewingkey1f33fr3zrquh869s3h8d0pjx4fpa9fyut2utw7x5y7xdcxz6z7c8sgf5hslrkpf3mh8d26vufsq8y666chx0x0su06ay3rkwu74zuwqq9w8aza',
            },
          ]);
        } else {
          return Promise.resolve([]);
        }
      }),
    };

    mockExtSessionCtx = {
      get: vi.fn().mockImplementation((key: string) => {
        if (key === 'passwordKey') {
          return Promise.resolve({
            _inner: {
              alg: 'A256GCM',
              ext: true,
              k: '2l2K1HKpGWaOriS58zwdDTwAMtMuczuUQc4IYzGxyhM',
              kty: 'oct',
              key_ops: ['encrypt', 'decrypt'],
            },
          });
        } else {
          return Promise.resolve(undefined);
        }
      }),
    };

    mockApproverCtx = vi.fn().mockImplementation(() => Promise.resolve(UserChoice.Approved));

    mockCtx = createHandlerContext({
      service: CustodyService,
      method: CustodyService.methods.authorize,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues()
        .set(extLocalCtx, mockExtLocalCtx as unknown)
        .set(approverCtx, mockApproverCtx as unknown)
        .set(extSessionCtx, mockExtSessionCtx as unknown)
        .set(servicesCtx, mockServices as unknown as Services),
    });

    for (const record of testAssetsMetadata) {
      mockIterateMetadata.next.mockResolvedValueOnce({
        value: record,
      });
    }
    mockIterateMetadata.next.mockResolvedValueOnce({
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

  test('should fail if user denies request', async () => {
    mockApproverCtx.mockImplementation(() => Promise.resolve(UserChoice.Denied));
    await expect(authorize(req, mockCtx)).rejects.toThrow();
  });

  test('should fail if plan is missing in request', async () => {
    await expect(authorize(new AuthorizeRequest(), mockCtx)).rejects.toThrow(
      'No plan included in request',
    );
  });

  test('should fail if user is not logged in extension', async () => {
    mockExtSessionCtx.get.mockImplementation(() => {
      return Promise.resolve(undefined);
    });
    await expect(authorize(req, mockCtx)).rejects.toThrow('User must login to extension');
  });

  test('should fail if incorrect password is used', async () => {
    mockExtSessionCtx.get.mockImplementation(() => {
      return Promise.resolve({
        _inner: {
          alg: 'A256GCM',
          ext: true,
          k: '1l2K1HKpGWaOriS58zwdDTwAMtMuczuUQc4IYzGxyhN',
          kty: 'oct',
          key_ops: ['encrypt', 'decrypt'],
        },
      });
    });
    await expect(authorize(req, mockCtx)).rejects.toThrow(
      'Unable to decrypt seed phrase with password',
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
