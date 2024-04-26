import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { validatorPenalty } from './validator-penalty';
import { MockServices } from '../test-utils';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { QueryService as StakingService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/stake/v1/stake_connect';
import { servicesCtx } from '../ctx/prax';
import {
  ValidatorPenaltyRequest,
  ValidatorPenaltyResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import type { ServicesInterface } from '@penumbra-zone/types/services';

describe('ValidatorPenalty request handler', () => {
  let mockServices: MockServices;
  let mockStakingQuerierValidatorPenalty: Mock;
  let mockCtx: HandlerContext;
  const mockValidatorPenaltyResponse = new ValidatorPenaltyResponse({
    penalty: { inner: new Uint8Array([0, 1, 2, 3]) },
  });

  beforeEach(() => {
    vi.resetAllMocks();

    mockStakingQuerierValidatorPenalty = vi.fn().mockResolvedValue(mockValidatorPenaltyResponse);

    mockServices = {
      querier: {
        staking: { validatorPenalty: mockStakingQuerierValidatorPenalty },
      },
    } satisfies MockServices;

    mockCtx = createHandlerContext({
      service: StakingService,
      method: StakingService.methods.validatorInfo,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(
        servicesCtx,
        mockServices as unknown as ServicesInterface,
      ),
    });
  });

  it("returns the response from the staking querier's `validatorPenalty` method", async () => {
    const req = new ValidatorPenaltyRequest();
    const result = await validatorPenalty(req, mockCtx);

    expect(mockStakingQuerierValidatorPenalty).toHaveBeenCalledWith(req);
    expect(result as ValidatorPenaltyResponse).toEqual(mockValidatorPenaltyResponse);
  });
});
