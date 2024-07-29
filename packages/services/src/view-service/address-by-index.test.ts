import { beforeEach, describe, expect, test } from 'vitest';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import {
  Address,
  AddressByIndexResponse,
  AddressByIndexRequest,
} from '@penumbra-zone/protobuf/types';
import { ViewService } from '@penumbra-zone/protobuf';
import { addressByIndex } from './address-by-index.js';
import { testFullViewingKey } from '../test-utils.js';
import { fvkCtx } from '../ctx/full-viewing-key.js';

describe('AddressByIndex request handler', () => {
  let mockCtx: HandlerContext;

  beforeEach(() => {
    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.addressByIndex,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(fvkCtx, () => Promise.resolve(testFullViewingKey)),
    });
  });

  test('should successfully get AddressByIndex with 0 index', async () => {
    const addressByIndexResponse = await addressByIndex(
      new AddressByIndexRequest({ addressIndex: { account: 0 } }),
      mockCtx,
    );
    expect(addressByIndexResponse.address).toBeInstanceOf(Address);
  });

  test('should successfully get AddressByIndex with no index', async () => {
    const addressByIndexResponse = await addressByIndex(new AddressByIndexRequest(), mockCtx);
    expect(addressByIndexResponse.address).toBeInstanceOf(Address);
  });

  test('addresses with different indexes should be different', async () => {
    const index0Response = new AddressByIndexResponse(
      await addressByIndex(new AddressByIndexRequest({ addressIndex: { account: 0 } }), mockCtx),
    );
    const index1Response = new AddressByIndexResponse(
      await addressByIndex(new AddressByIndexRequest({ addressIndex: { account: 1 } }), mockCtx),
    );
    expect(index0Response.address?.equals(index1Response.address)).toBeFalsy();
  });
});
