import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  AppParametersRequest,
  AppParametersResponse,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import { servicesCtx } from '../ctx/prax.js';
import { AppParameters } from '@penumbra-zone/protobuf/penumbra/core/app/v1/app_pb';
import { appParameters } from './app-parameters.js';
import { mockIndexedDb, MockServices, createUpdates } from '../test-utils.js';
import type { ServicesInterface } from '@penumbra-zone/types/services';

describe('AppParameters request handler', () => {
  let mockServices: MockServices;

  let mockCtx: HandlerContext;

  beforeEach(() => {
    vi.resetAllMocks();

    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({ indexedDb: mockIndexedDb }),
      ) as MockServices['getWalletServices'],
    };
    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.appParameters,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(servicesCtx, () =>
        Promise.resolve(mockServices as unknown as ServicesInterface),
      ),
    });
  });

  test('should successfully get appParameters when idb has them', async () => {
    mockIndexedDb.getAppParams.mockResolvedValue(testData);
    const appParameterResponse = new AppParametersResponse(
      await appParameters(new AppParametersRequest(), mockCtx),
    );
    expect(appParameterResponse.parameters?.equals(testData)).toBeTruthy();
  });

  test('should wait for appParameters when idb has none', async () => {
    mockIndexedDb.getAppParams.mockResolvedValue(undefined);

    mockIndexedDb.subscribe.mockImplementationOnce(async function* (table) {
      switch (table) {
        case 'APP_PARAMETERS':
          yield* createUpdates(table, [new AppParametersRequest().toJson()]);
          break;
        default:
          expect.unreachable(`Test should not subscribe to ${table}`);
      }
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
