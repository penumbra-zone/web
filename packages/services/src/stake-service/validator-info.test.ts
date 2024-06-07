import {
  ValidatorInfoRequest,
  ValidatorInfoResponse,
  ValidatorState_ValidatorStateEnum,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { PartialMessage } from '@bufbuild/protobuf';
import { HandlerContext, createContextValues, createHandlerContext } from '@connectrpc/connect';
import { StakeService } from '@penumbra-zone/protobuf';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { idbCtx } from '../ctx/prax';
import { IndexedDbMock } from '../test-utils';
import { validatorInfo } from './validator-info';

describe('ValidatorInfo request handler', () => {
  let mockIndexedDb: IndexedDbMock;
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

  beforeEach(() => {
    vi.resetAllMocks();

    const mockIterateValidatorInfos = {
      next: vi.fn(),
      [Symbol.asyncIterator]: () => mockIterateValidatorInfos,
    };
    mockIterateValidatorInfos.next.mockResolvedValueOnce({
      value: mockValidatorInfoResponse1.validatorInfo,
    });
    mockIterateValidatorInfos.next.mockResolvedValueOnce({
      value: mockValidatorInfoResponse2.validatorInfo,
    });
    mockIterateValidatorInfos.next.mockResolvedValueOnce({ done: true });

    mockIndexedDb = {
      iterateValidatorInfos: () => mockIterateValidatorInfos,
    };
    mockCtx = createHandlerContext({
      service: StakeService,
      method: StakeService.methods.validatorInfo,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(idbCtx, () =>
        Promise.resolve(mockIndexedDb as unknown),
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
