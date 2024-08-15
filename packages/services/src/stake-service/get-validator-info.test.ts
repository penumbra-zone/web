import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { IndexedDbMock, MockServices } from '../test-utils.js';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { StakeService } from '@penumbra-zone/protobuf';
import { servicesCtx } from '../ctx/prax.js';
import {
  GetValidatorInfoRequest,
  GetValidatorInfoResponse,
  ValidatorState_ValidatorStateEnum,
} from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import type { ServicesInterface } from '@penumbra-zone/types/services';
import { getValidatorInfo } from './get-validator-info.js';

describe('GetValidatorInfo request handler', () => {
  let mockServices: MockServices;
  let mockIndexedDb: IndexedDbMock;
  let mockStakingQuerierValidatorInfo: Mock;
  let mockCtx: HandlerContext;
  let req: GetValidatorInfoRequest;
  const mockGetValidatorInfoResponse = new GetValidatorInfoResponse({
    validatorInfo: {
      validator: { name: 'Validator 1', identityKey: { ik: new Uint8Array(32) } },
      status: { state: { state: ValidatorState_ValidatorStateEnum.ACTIVE } },
    },
  });

  beforeEach(() => {
    vi.resetAllMocks();

    mockIndexedDb = {
      getValidatorInfo: vi.fn(),
    };

    mockStakingQuerierValidatorInfo = vi.fn();

    mockServices = {
      getWalletServices: vi.fn(() =>
        Promise.resolve({
          indexedDb: mockIndexedDb,
          querier: {
            stake: { validatorInfo: mockStakingQuerierValidatorInfo },
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

    req = new GetValidatorInfoRequest({
      identityKey: mockGetValidatorInfoResponse.validatorInfo?.validator?.identityKey,
    });
  });

  it('should fail to get validator info if identity key is not passed', async () => {
    await expect(getValidatorInfo(new GetValidatorInfoRequest(), mockCtx)).rejects.toThrow(
      'Missing identityKey in request',
    );
  });

  it('should successfully return validator info when idb has them', async () => {
    mockIndexedDb.getValidatorInfo?.mockResolvedValueOnce(
      mockGetValidatorInfoResponse.validatorInfo,
    );

    const validatorInfoResponse = await getValidatorInfo(req, mockCtx);
    expect(validatorInfoResponse.validatorInfo).toEqual(mockGetValidatorInfoResponse.validatorInfo);
  });

  it('should successfully return validator info when ibd does not, but remote does have them', async () => {
    mockStakingQuerierValidatorInfo = vi.fn().mockResolvedValue(mockGetValidatorInfoResponse);

    const validatorInfoResponse = await getValidatorInfo(req, mockCtx);
    expect(validatorInfoResponse.validatorInfo).toEqual(mockGetValidatorInfoResponse.validatorInfo);
  });

  it('should fail to get validator info when idb has none', async () => {
    mockStakingQuerierValidatorInfo = vi.fn().mockResolvedValue({});

    await expect(getValidatorInfo(req, mockCtx)).rejects.toThrow('No found validator info');
  });
});
