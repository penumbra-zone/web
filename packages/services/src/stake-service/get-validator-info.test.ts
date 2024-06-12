import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DbMock } from '../test-utils';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { StakeService } from '@penumbra-zone/protobuf';
import {
  GetValidatorInfoRequest,
  GetValidatorInfoResponse,
  ValidatorState_ValidatorStateEnum,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb';
import { getValidatorInfo } from './get-validator-info';
import { dbCtx } from '../ctx/database';
import { DatabaseCtx } from '../ctx/database';

describe('GetValidatorInfo request handler', () => {
  let mockIndexedDb: DbMock;
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

    req = new GetValidatorInfoRequest({
      identityKey: mockGetValidatorInfoResponse.validatorInfo?.validator?.identityKey,
    });
  });

  it('should successfully get validator info when idb has them', async () => {
    mockIndexedDb.getValidatorInfo?.mockResolvedValueOnce(
      mockGetValidatorInfoResponse.validatorInfo,
    );

    const validatorInfoResponse = await getValidatorInfo(req, mockCtx);
    expect(validatorInfoResponse.validatorInfo).toEqual(mockGetValidatorInfoResponse.validatorInfo);
  });

  it('should fail to get validator info when idb has none', async () => {
    await expect(getValidatorInfo(req, mockCtx)).rejects.toThrow('No found validator info');
  });

  it('should fail to get validator info if identity key is not passed', async () => {
    await expect(getValidatorInfo(new GetValidatorInfoRequest(), mockCtx)).rejects.toThrow(
      'Missing identityKey in request',
    );
  });
});
