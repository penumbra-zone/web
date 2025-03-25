import { Mock, beforeEach, describe, expect, test, vi } from 'vitest';
import { create, equals } from '@bufbuild/protobuf';
import {
  AppParametersRequestSchema,
  AppParametersResponseSchema,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import { servicesCtx } from '../ctx/prax.js';
import { appParameters } from './app-parameters.js';
import { IndexedDbMock, MockServices } from '../test-utils.js';
import type { ServicesInterface } from '@penumbra-zone/types/services';
import { AppParametersSchema } from '@penumbra-zone/protobuf/penumbra/core/app/v1/app_pb';

describe('AppParameters request handler', () => {
  let mockServices: MockServices;
  let mockIndexedDb: IndexedDbMock;
  let mockCtx: HandlerContext;
  let apSubNext: Mock;

  beforeEach(() => {
    vi.resetAllMocks();

    apSubNext = vi.fn();

    const mockAppParametersSubscription = {
      next: apSubNext,
      [Symbol.asyncIterator]: () => mockAppParametersSubscription,
    };

    mockIndexedDb = {
      getAppParams: vi.fn(),
      subscribe: (table: string) => {
        if (table === 'APP_PARAMETERS') {
          return mockAppParametersSubscription;
        }
        throw new Error('Table not supported');
      },
    };

    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({ indexedDb: mockIndexedDb }),
      ) as MockServices['getWalletServices'],
    };
    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.method.appParameters,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(servicesCtx, () =>
        Promise.resolve(mockServices as unknown as ServicesInterface),
      ),
    });
  });

  test('should successfully get appParameters when idb has them', async () => {
    mockIndexedDb.getAppParams?.mockResolvedValue(testData);
    const appParameterResponse = create(
      AppParametersResponseSchema,
      await appParameters(create(AppParametersRequestSchema), mockCtx),
    );
    expect(
      appParameterResponse.parameters &&
        equals(AppParametersSchema, appParameterResponse.parameters, testData),
    ).toBeTruthy();
  });

  test('should wait for appParameters when idb has none', async () => {
    mockIndexedDb.getAppParams?.mockResolvedValue(undefined);
    apSubNext.mockResolvedValueOnce({
      value: { value: create(AppParametersRequestSchema), table: 'APP_PARAMETERS' },
    });
    await expect(appParameters(create(AppParametersRequestSchema), mockCtx)).resolves.toBeTruthy();
  });
});

const testData = create(AppParametersSchema, {
  chainId: 'penumbra-testnet-titan',
  sctParams: {
    epochDuration: 719n,
  },
  shieldedPoolParams: {
    fixedFmdParams: { asOfBlockHeight: 1n, precisionBits: 0 },
  },
  communityPoolParams: {
    communityPoolSpendProposalsEnabled: true,
  },
  governanceParams: {
    proposalVotingBlocks: 17280n,
    proposalDepositAmount: {
      lo: 10000000n,
    },
    proposalValidQuorum: '40/100',
    proposalPassThreshold: '50/100',
    proposalSlashThreshold: '80/100',
  },
  ibcParams: {
    ibcEnabled: true,
    inboundIcs20TransfersEnabled: true,
    outboundIcs20TransfersEnabled: true,
  },
  stakeParams: {
    unbondingEpochs: 2n,
    activeValidatorLimit: 80n,
    baseRewardRate: 30000n,
    slashingPenaltyMisbehavior: 10000000n,
    slashingPenaltyDowntime: 10000n,
    signedBlocksWindowLen: 10000n,
    missedBlocksMaximum: 9500n,
  },
  feeParams: {},
  distributionsParams: {
    stakingIssuancePerBlock: 1n,
  },
});
