import { beforeEach, describe, expect, it, vi } from 'vitest';
import { validatorInfo } from './validator-info';
import { IndexedDbMock, MockServices } from '../test-utils';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { QueryService as StakingService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/stake/v1/stake_connect';
import { servicesCtx } from '../../ctx';
import {
  ValidatorInfoRequest,
  ValidatorInfoResponse,
  ValidatorState_ValidatorStateEnum,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { PartialMessage } from '@bufbuild/protobuf';
import type { ServicesInterface } from '@penumbra-zone/types/src/services';

describe('ValidatorInfo request handler', () => {
  let mockServices: MockServices;
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
    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({ indexedDb: mockIndexedDb }),
      ) as MockServices['getWalletServices'],
    };
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
