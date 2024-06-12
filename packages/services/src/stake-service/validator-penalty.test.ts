import { beforeEach, describe, expect, it, vi } from 'vitest';
import { validatorPenalty } from './validator-penalty';
import {
  createContextValues,
  createHandlerContext,
  createRouterTransport,
  HandlerContext,
} from '@connectrpc/connect';
import { StakeService } from '@penumbra-zone/protobuf';
import {
  ValidatorPenaltyRequest,
  ValidatorPenaltyResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { fullnodeCtx } from '../ctx/fullnode';
import { mockStakeService } from '../test-utils';

describe('ValidatorPenalty request handler', () => {
  let mockCtx: HandlerContext;
  const mockValidatorPenaltyResponse = new ValidatorPenaltyResponse({
    penalty: { inner: new Uint8Array([0, 1, 2, 3]) },
  });

  beforeEach(() => {
    vi.resetAllMocks();

    mockStakeService.validatorPenalty.mockResolvedValue(mockValidatorPenaltyResponse);

    mockCtx = createHandlerContext({
      service: StakeService,
      method: StakeService.methods.validatorInfo,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(fullnodeCtx, () =>
        Promise.resolve(
          createRouterTransport(({ service }) => service(StakeService, mockStakeService)),
        ),
      ),
    });
  });

  it("returns the response from the staking querier's `validatorPenalty` method", async () => {
    const req = new ValidatorPenaltyRequest();
    const result = await validatorPenalty(req, mockCtx);

    expect(mockStakeService.validatorPenalty).toHaveBeenCalled();
    expect(result as ValidatorPenaltyResponse).toEqual(mockValidatorPenaltyResponse);
  });
});
