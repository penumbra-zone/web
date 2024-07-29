import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { ValidatorPenaltyRequest, ValidatorPenaltyResponse } from '@penumbra-zone/protobuf/types';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import type { ServicesInterface } from '@penumbra-zone/types/services';
import { StakeService } from '@penumbra-zone/protobuf';
import { validatorPenalty } from './validator-penalty.js';
import { MockServices } from '../test-utils.js';
import { servicesCtx } from '../ctx/prax.js';

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
      getWalletServices: vi.fn(() =>
        Promise.resolve({
          querier: {
            stake: { validatorPenalty: mockStakingQuerierValidatorPenalty },
          },
        }),
      ) as MockServices['getWalletServices'],
    } satisfies MockServices;

    mockCtx = createHandlerContext({
      service: StakeService,
      method: StakeService.methods.validatorInfo,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(servicesCtx, () =>
        Promise.resolve(mockServices as unknown as ServicesInterface),
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
