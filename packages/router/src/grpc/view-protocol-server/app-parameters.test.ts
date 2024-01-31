import { beforeEach, describe, expect, test } from 'vitest';
import {
  AppParametersRequest,
  AppParametersResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ServicesInterface } from '@penumbra-zone/types';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import { servicesCtx } from '../../ctx';
import { AppParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/app/v1alpha1/app_pb';
import { appParameters } from './app-parameters';

describe('AppParameters request handler', () => {
  let mockServices: ServicesInterface;
  let mockCtx: HandlerContext;

  beforeEach(() => {
    mockServices = {
      querier: {
        app: {
          appParams(): Promise<AppParameters> {
            return Promise.resolve(testData);
          },
        },
      },
    } as ServicesInterface;

    mockCtx = createHandlerContext({
      service: ViewProtocolService,
      method: ViewProtocolService.methods.appParameters,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      contextValues: createContextValues().set(servicesCtx, mockServices),
    });
  });

  test('should successfully get appParameters', async () => {
    const appParameterResponse = new AppParametersResponse(
      await appParameters(new AppParametersRequest(), mockCtx),
    );
    expect(appParameterResponse.parameters?.equals(testData)).toBeTruthy();
  });
});

// TODO chainParams will be removed, chain id will be a top-level field https://github.com/penumbra-zone/penumbra/pull/3703
const testData = new AppParameters({
  chainParams: {
    chainId: 'penumbra-testnet-titan',
    epochDuration: 719n,
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
