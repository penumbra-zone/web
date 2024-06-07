import {
  ValidatorPenaltyRequest,
  ValidatorPenaltyResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { StakeService } from '@penumbra-zone/protobuf';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { querierCtx } from '../ctx/prax';
import { MockQuerier } from '../test-utils';
import { validatorPenalty } from './validator-penalty';

describe('ValidatorPenalty request handler', () => {
  let mockStakingQuerierValidatorPenalty: Mock;
  let mockQuerier: MockQuerier;
  let mockCtx: HandlerContext;
  const mockValidatorPenaltyResponse = new ValidatorPenaltyResponse({
    penalty: { inner: new Uint8Array([0, 1, 2, 3]) },
  });

  beforeEach(() => {
    vi.resetAllMocks();

    mockStakingQuerierValidatorPenalty = vi.fn().mockResolvedValue(mockValidatorPenaltyResponse);

    mockQuerier = {
      stake: { validatorPenalty: mockStakingQuerierValidatorPenalty },
    };

    mockCtx = createHandlerContext({
      service: StakeService,
      method: StakeService.methods.validatorInfo,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(querierCtx, () =>
        Promise.resolve(mockQuerier as unknown),
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
