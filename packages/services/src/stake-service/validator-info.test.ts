import { beforeEach, describe, expect, it, vi } from 'vitest';
import { validatorInfo } from './validator-info';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { StakeService } from '@penumbra-zone/protobuf';
import {
  ValidatorInfoRequest,
  ValidatorInfoResponse,
  ValidatorState_ValidatorStateEnum,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { PartialMessage } from '@bufbuild/protobuf';
import { DatabaseCtx } from '../ctx/database';
import { dbCtx } from '../ctx/database';
import { mockIndexedDb } from '../test-utils';

describe('ValidatorInfo request handler', () => {
  let mockCtx: HandlerContext;
  const mockValidatorInfoResponse1 = new ValidatorInfoResponse({
    validatorInfo: {
      validator: { name: 'Validator 1' },
      status: { state: { state: ValidatorState_ValidatorStateEnum.ACTIVE } },
    },
  });
  const mockValidatorInfoResponse2 = new ValidatorInfoResponse({
    validatorInfo: {
      validator: { name: 'Validator 2' },
      status: { state: { state: ValidatorState_ValidatorStateEnum.INACTIVE } },
    },
  });
  const mockIterateValidatorInfos = {
    next: vi.fn(),
    [Symbol.asyncIterator]: () => mockIterateValidatorInfos,
  };

  beforeEach(() => {
    vi.resetAllMocks();

    mockIndexedDb.iterateValidatorInfos.mockImplementation(async function* () {
      yield* await Promise.resolve([
        mockValidatorInfoResponse1.validatorInfo!,
        mockValidatorInfoResponse2.validatorInfo!,
      ]);
    });

    mockCtx = createHandlerContext({
      service: StakeService,
      method: StakeService.methods.validatorInfo,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(dbCtx, () =>
        Promise.resolve(mockIndexedDb as unknown as DatabaseCtx),
      ),
    });
  });

  it('streams `ValidatorInfoResponse`s from the results of the database query', async () => {
    const req = new ValidatorInfoRequest({ showInactive: true });

    const results: (ValidatorInfoResponse | PartialMessage<ValidatorInfoResponse>)[] = [];
    for await (const result of validatorInfo(req, mockCtx)) {
      results.push(result);
    }

    expect(results).toEqual([mockValidatorInfoResponse1, mockValidatorInfoResponse2]);
  });

  it('does not include inactive validators by default', async () => {
    const req = new ValidatorInfoRequest();

    const results: (ValidatorInfoResponse | PartialMessage<ValidatorInfoResponse>)[] = [];
    for await (const result of validatorInfo(req, mockCtx)) {
      results.push(result);
    }

    expect(results).toEqual([mockValidatorInfoResponse1]);
  });
});
