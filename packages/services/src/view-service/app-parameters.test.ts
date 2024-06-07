import { AppParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/app/v1/app_pb';
import {
  AppParametersRequest,
  AppParametersResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { HandlerContext, createContextValues, createHandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import { Mock, beforeEach, describe, expect, test, vi } from 'vitest';
import { idbCtx } from '../ctx/prax';
import { IndexedDbMock } from '../test-utils';
import { appParameters } from './app-parameters';

describe('AppParameters request handler', () => {
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
        if (table === 'APP_PARAMETERS') return mockAppParametersSubscription;
        throw new Error('Table not supported');
      },
    };

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.appParameters,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(idbCtx, () =>
        Promise.resolve(mockIndexedDb as unknown),
      ),
    });
  });

  test('should successfully get appParameters when idb has them', async () => {
    mockIndexedDb.getAppParams?.mockResolvedValue(testData);
    const appParameterResponse = new AppParametersResponse(
      await appParameters(new AppParametersRequest(), mockCtx),
    );
    expect(appParameterResponse.parameters?.equals(testData)).toBeTruthy();
  });

  test('should wait for appParameters when idb has none', async () => {
    mockIndexedDb.getAppParams?.mockResolvedValue(undefined);
    apSubNext.mockResolvedValueOnce({
      value: { value: new AppParametersRequest(), table: 'APP_PARAMETERS' },
    });
    await expect(appParameters(new AppParametersRequest(), mockCtx)).resolves.toBeTruthy();
  });
});

const testData = new AppParameters({
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
