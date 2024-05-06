import { beforeEach, describe, expect, test } from 'vitest';
import {
  AddressByIndexRequest,
  AddressByIndexResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { addressByIndex } from './address-by-index';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { testFullViewingKey } from '../test-utils';
import { fvkCtx } from '../ctx/full-viewing-key';

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
