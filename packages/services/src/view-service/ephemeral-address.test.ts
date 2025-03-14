import { beforeEach, describe, expect, test } from 'vitest';
import { create, equals } from '@bufbuild/protobuf';
import {
  EphemeralAddressRequestSchema,
  EphemeralAddressResponseSchema,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import { AddressSchema } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { ephemeralAddress } from './ephemeral-address.js';
import { testFullViewingKey } from '../test-utils.js';
import { fvkCtx } from '../ctx/full-viewing-key.js';

describe('EphemeralAddress request handler', () => {
  let mockCtx: HandlerContext;

  beforeEach(() => {
    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.method.ephemeralAddress,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(fvkCtx, () => Promise.resolve(testFullViewingKey)),
    });
  });

  test('should successfully get EphemeralAddress', async () => {
    const ephemeralAddressResponse = await ephemeralAddress(
      create(EphemeralAddressRequestSchema, { addressIndex: { account: 0 } }),
      mockCtx,
    );
    expect(ephemeralAddressResponse.address).toBeTruthy();
  });

  test('should get an error if addressIndex is missing', async () => {
    await expect(ephemeralAddress(create(EphemeralAddressRequestSchema), mockCtx)).rejects.toThrow(
      'Missing address index',
    );
  });

  test('addresses with different indexes should be different', async () => {
    const ephemeral1Response = create(
      EphemeralAddressResponseSchema,
      await ephemeralAddress(
        create(EphemeralAddressRequestSchema, { addressIndex: { account: 1 } }),
        mockCtx,
      ),
    );
    const ephemeral2Response = create(
      EphemeralAddressResponseSchema,
      await ephemeralAddress(
        create(EphemeralAddressRequestSchema, { addressIndex: { account: 2 } }),
        mockCtx,
      ),
    );
    expect(
      equals(AddressSchema, ephemeral1Response.address!, ephemeral2Response.address!),
    ).toBeFalsy();
  });

  test('addresses with same indexes should be different', async () => {
    const ephemeralFirst = create(
      EphemeralAddressResponseSchema,
      await ephemeralAddress(
        create(EphemeralAddressRequestSchema, { addressIndex: { account: 3 } }),
        mockCtx,
      ),
    );
    const ephemeralSecond = create(
      EphemeralAddressResponseSchema,
      await ephemeralAddress(
        create(EphemeralAddressRequestSchema, { addressIndex: { account: 3 } }),
        mockCtx,
      ),
    );
    expect(equals(AddressSchema, ephemeralFirst.address!, ephemeralSecond.address!)).toBeFalsy();
  });
});
