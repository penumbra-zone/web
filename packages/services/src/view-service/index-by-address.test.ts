import { beforeEach, describe, expect, test } from 'vitest';
import { IndexByAddressRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import {
  Address,
  FullViewingKey,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { indexByAddress } from './index-by-address';
import { getAddressByIndex, getEphemeralByIndex } from '@penumbra-zone/wasm/keys';
import { fullViewingKeyFromBech32m } from '@penumbra-zone/bech32m/penumbrafullviewingkey';
import { testFullViewingKey } from '../test-utils';
import { fvkCtx } from '../ctx/full-viewing-key';

describe('IndexByAddress request handler', () => {
  let mockCtx: HandlerContext;
  let testAddress: Address;

  beforeEach(() => {
    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.indexByAddress,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(fvkCtx, () => Promise.resolve(testFullViewingKey)),
    });

    testAddress = getAddressByIndex(testFullViewingKey, 0);
  });

  test('should successfully get index for a given address', async () => {
    const addressByIndexResponse = await indexByAddress(
      new IndexByAddressRequest({ address: testAddress }),
      mockCtx,
    );
    expect(addressByIndexResponse.addressIndex?.account === 0).toBeTruthy();
  });

  test('should successfully get index for ephemeral address', async () => {
    testAddress = getEphemeralByIndex(testFullViewingKey, 2);

    const addressByIndexResponse = await indexByAddress(
      new IndexByAddressRequest({ address: testAddress }),
      mockCtx,
    );
    expect(addressByIndexResponse.addressIndex?.account === 2).toBeTruthy();
  });

  test('should return empty index for address that is associated with another FVK', async () => {
    const anotherFVK = new FullViewingKey(
      fullViewingKeyFromBech32m(
        'penumbrafullviewingkey1f33fr3zrquh869s3h8d0pjx4fpa9fyut2utw7x5y7xdcxz6z7c8sgf5hslrkpf3mh8d26vufsq8y666chx0x0su06ay3rkwu74zuwqq9w8aza',
      ),
    );

    testAddress = getEphemeralByIndex(anotherFVK, 5);

    const addressByIndexResponse = await indexByAddress(
      new IndexByAddressRequest({ address: testAddress }),
      mockCtx,
    );
    expect(addressByIndexResponse.addressIndex).toBeUndefined();
  });
});
