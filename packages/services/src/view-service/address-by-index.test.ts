import { beforeEach, describe, expect, test } from 'vitest';
import { create, equals } from '@bufbuild/protobuf';
import {
  AddressByIndexRequestSchema,
  AddressByIndexResponseSchema,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import { addressByIndex } from './address-by-index.js';
import { AddressSchema } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { testFullViewingKey } from '../test-utils.js';
import { fvkCtx } from '../ctx/full-viewing-key.js';

describe('AddressByIndex request handler', () => {
  let mockCtx: HandlerContext;

  beforeEach(() => {
    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.method.addressByIndex,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(fvkCtx, () => Promise.resolve(testFullViewingKey)),
    });
  });

  test('should successfully get AddressByIndex with 0 index', async () => {
    const addressByIndexResponse = await addressByIndex(
      create(AddressByIndexRequestSchema, { addressIndex: { account: 0 } }),
      mockCtx,
    );
    expect(addressByIndexResponse.address).toBeTruthy();
  });

  test('should successfully get AddressByIndex with no index', async () => {
    const addressByIndexResponse = await addressByIndex(
      create(AddressByIndexRequestSchema),
      mockCtx,
    );
    expect(addressByIndexResponse.address).toBeTruthy();
  });

  test('addresses with different indexes should be different', async () => {
    const index0Response = create(
      AddressByIndexResponseSchema,
      await addressByIndex(
        create(AddressByIndexRequestSchema, { addressIndex: { account: 0 } }),
        mockCtx,
      ),
    );
    const index1Response = create(
      AddressByIndexResponseSchema,
      await addressByIndex(
        create(AddressByIndexRequestSchema, { addressIndex: { account: 1 } }),
        mockCtx,
      ),
    );
    expect(
      index0Response.address &&
        index1Response.address &&
        equals(AddressSchema, index0Response.address, index1Response.address),
    ).toBeFalsy();
  });
});
