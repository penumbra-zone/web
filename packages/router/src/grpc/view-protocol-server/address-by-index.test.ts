import { beforeEach, describe, expect, test } from 'vitest';
import {
  AddressByIndexRequest,
  AddressByIndexResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { servicesCtx } from '../../ctx';
import { addressByIndex } from './address-by-index';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import type { ServicesInterface } from '@penumbra-zone/types/src/services';

describe('AddressByIndex request handler', () => {
  let mockServices: ServicesInterface;
  let mockCtx: HandlerContext;

  beforeEach(() => {
    mockServices = {
      getWalletServices: () =>
        Promise.resolve({
          viewServer: {
            fullViewingKey:
              'penumbrafullviewingkey1vzfytwlvq067g2kz095vn7sgcft47hga40atrg5zu2crskm6tyyjysm28qg5nth2fqmdf5n0q530jreumjlsrcxjwtfv6zdmfpe5kqsa5lg09',
          },
        }),
    } as ServicesInterface;

    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.addressByIndex,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(servicesCtx, mockServices),
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
