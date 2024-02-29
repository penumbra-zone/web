import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  WitnessRequest,
  WitnessResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { ServicesInterface } from '@penumbra-zone/types';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { servicesCtx } from '../../ctx';
import { IndexedDbMock, MockServices } from './test-utils';
import { witness } from './witness';
import {
  TransactionPlan,
  WitnessData,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';

describe('Witness request handler', () => {
  let mockServices: MockServices;
  let mockIndexedDb: IndexedDbMock;
  let mockCtx: HandlerContext;
  let req: WitnessRequest;

  beforeEach(() => {
    vi.resetAllMocks();

    mockIndexedDb = {
      getStateCommitmentTree: vi.fn(),
    };
    mockServices = {
      getWalletServices: vi.fn(() => Promise.resolve({ indexedDb: mockIndexedDb })),
    };
    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.witness,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(
        servicesCtx,
        mockServices as unknown as ServicesInterface,
      ),
    });
    req = new WitnessRequest({
      transactionPlan: testPlan,
    });
  });

  test('should successfully create witness data', async () => {
    mockIndexedDb.getStateCommitmentTree?.mockResolvedValue(testSct);
    const witnessResponse = new WitnessResponse(await witness(req, mockCtx));
    expect(witnessResponse.witnessData).instanceof(WitnessData);
  });

  test('should throw error if transaction plan is missing in request', async () => {
    await expect(witness(new WitnessRequest(), mockCtx)).rejects.toThrow();
  });
});

const testSct = {
  last_position: { Position: { epoch: 5, block: 51, commitment: 0 } },
  last_forgotten: 0n,
  hashes: [],
  commitments: [
    {
      position: { epoch: 5, block: 40, commitment: 1 },
      commitment: {
        inner: '+et9QvGlWAzKXPYBEiUQ3zrACaOOoEZTdM0Ru+/22Q0=',
      },
    },
  ],
};
const testPlan = TransactionPlan.fromJson({
  actions: [
    {
      output: {
        value: {
          amount: {
            lo: '17000000',
          },
          assetId: {
            inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
          },
        },
        destAddress: {
          inner:
            '0AI1VPl2Z2iM62nnBX+o00kL3Fcvcqm8zgp0ErDpw4hT2syB5TeaGJM8B+5KV+/3CS78toGM3WleoNgPh/7L9bKNOrmq7UEqBmfAb7MDI+w=',
        },
        rseed: '/3i6n9kAwHRK7BglIH0QWZcwVjYeIhXcETFjgw4quNg=',
        valueBlinding: 'oN/74T2n6BCbAD9fexKTYN7/EdgamOhzu0T1CaCyvwA=',
        proofBlindingR: 'dx8BFun9Ecae4G5K35O+odpgIiW38Si/8af6v3BbiAI=',
        proofBlindingS: 'tAK8dKHm4QfTmPDazgGeODGmz7NAcRZZqNjc5ngdsgA=',
      },
    },
    {
      spend: {
        note: {
          value: {
            amount: {
              lo: '999978000000',
            },
            assetId: {
              inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
            },
          },
          rseed: 'H/Fy4tVGBPaCmYr7xskZ0cEhD79fj0bm/P2goI7NE+g=',
          address: {
            inner:
              'H54tVYCe2KONaws0+4Qt8jHSup2InYWauNEGtLa7+yQ8ssaP1Qc2bjsB7uyfQl3QKMXzfm3u70/CbK9tOiSXjDtDzx3AtQw2wKCeuht3Ono=',
          },
        },
        position: '21477457921',
        randomizer: 'H7NTioroyZVJ/axRjF9rFOTraMKY4/oI5rZ5ioc5XAI=',
        valueBlinding: 'A8uFN42ZUkmm7K+mfMMIjrXWhQRR7gDSuFoHbUS63QI=',
        proofBlindingR: 'oDcDqoOeA+cmJx9+85o3NjBO5F7czVTdpgZsd6AF0hE=',
        proofBlindingS: 'AgGH9qmBSNerolyHPBfwjUn1hSR5o3asMrWflj4wrQk=',
      },
    },
    {
      output: {
        value: {
          amount: {
            lo: '999961000000',
          },
          assetId: {
            inner: 'KeqcLzNx9qSH5+lcJHBB9KNW+YPrBk5dKzvPMiypahA=',
          },
        },
        destAddress: {
          inner:
            'H54tVYCe2KONaws0+4Qt8jHSup2InYWauNEGtLa7+yQ8ssaP1Qc2bjsB7uyfQl3QKMXzfm3u70/CbK9tOiSXjDtDzx3AtQw2wKCeuht3Ono=',
        },
        rseed: 'fk7N8WEob+bgE/i0CZgmHGP8e0mGFHjKW2yzC7zKoUY=',
        valueBlinding: 'TFPHBogTl0+n+aSf0X4ygrQ+i6Mc9s3a+6jbTTlidQA=',
        proofBlindingR: 'uxySUkOiKig72CiH6q5Lx+5bDkGko4SxhJ+pZVuTohE=',
        proofBlindingS: 'UKzlbj48dd24R2yl4UwB8vU8Lda1TN5+qGpQ8jFsIgQ=',
      },
    },
  ],
  transactionParameters: {
    chainId: 'penumbra-testnet-deimos-2-38b9a683',
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
        rseed: 'dDfkKQanWSTxc5w7su42ru+tTnD6xbJUJBhEGbpOY/8=',
      },
      {
        address: {
          inner:
            'H54tVYCe2KONaws0+4Qt8jHSup2InYWauNEGtLa7+yQ8ssaP1Qc2bjsB7uyfQl3QKMXzfm3u70/CbK9tOiSXjDtDzx3AtQw2wKCeuht3Ono=',
        },
        rseed: 'V3Vvhh7r9/1P/XmJrlwrFmeUhQ9JzbYbS+0GvhsHnIQ=',
      },
    ],
  },
  memo: {
    plaintext: {
      returnAddress: {
        inner:
          'H54tVYCe2KONaws0+4Qt8jHSup2InYWauNEGtLa7+yQ8ssaP1Qc2bjsB7uyfQl3QKMXzfm3u70/CbK9tOiSXjDtDzx3AtQw2wKCeuht3Ono=',
      },
    },
    key: 'y1Hc7R18awsR3rxn3EWaBDmWHYMiFVhC2gviFG7FA90=',
  },
});
