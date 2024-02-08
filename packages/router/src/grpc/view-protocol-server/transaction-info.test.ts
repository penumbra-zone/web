import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  AppParametersRequest,
  AppParametersResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ServicesInterface } from '@penumbra-zone/types';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import { servicesCtx } from '../../ctx';
import { AppParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/app/v1alpha1/app_pb';
import { appParameters } from './app-parameters';
import { IndexedDbMock, MockServices } from './test-utils';

describe('TransactionInfo request handler', () => {
  let mockServices: MockServices;
  let mockIndexedDb: IndexedDbMock;
  let mockCtx: HandlerContext;

  beforeEach(() => {
    vi.resetAllMocks();

    mockIndexedDb = {
      iterateTransactionInfo: vi.fn(),
    };
    mockServices = {
      getWalletServices: vi.fn(() => Promise.resolve({ indexedDb: mockIndexedDb })),
    };
    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.transactionInfo,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      contextValues: createContextValues().set(
        servicesCtx,
        mockServices as unknown as ServicesInterface,
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
