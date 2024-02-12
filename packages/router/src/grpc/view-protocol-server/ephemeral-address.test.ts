import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  EphemeralAddressRequest,
  EphemeralAddressResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { ServicesInterface } from '@penumbra-zone/types';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { servicesCtx } from '../../ctx';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { ephemeralAddress } from './ephemeral-address';

describe('EphemeralAddress request handler', () => {
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
      method: ViewService.methods.ephemeralAddress,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      contextValues: createContextValues().set(servicesCtx, mockServices),
    });
  });

  test('should successfully get EphemeralAddress', async () => {
    const ephemeralAddressResponse = await ephemeralAddress(
      new EphemeralAddressRequest({ addressIndex: { account: 0 } }),
      mockCtx,
    );
    expect(ephemeralAddressResponse.address).toBeInstanceOf(Address);
  });

  test('should get an error if addressIndex is missing', async () => {
    await expect(ephemeralAddress(new EphemeralAddressRequest(), mockCtx)).rejects.toThrow(
      'Missing address index',
    );
  });

  test('addresses with different indexes should be different', async () => {
    const ephemeral1Response = new EphemeralAddressResponse(
      await ephemeralAddress(
        new EphemeralAddressRequest({ addressIndex: { account: 1 } }),
        mockCtx,
      ),
    );
    const ephemeral2Response = new EphemeralAddressResponse(
      await ephemeralAddress(
        new EphemeralAddressRequest({ addressIndex: { account: 2 } }),
        mockCtx,
      ),
    );
    expect(ephemeral1Response.address?.equals(ephemeral2Response.address)).toBeFalsy();
  });

  test('addresses with same indexes should be different', async () => {
    const ephemeralFirst = new EphemeralAddressResponse(
      await ephemeralAddress(
        new EphemeralAddressRequest({ addressIndex: { account: 3 } }),
        mockCtx,
      ),
    );
    const ephemeralSecond = new EphemeralAddressResponse(
      await ephemeralAddress(
        new EphemeralAddressRequest({ addressIndex: { account: 3 } }),
        mockCtx,
      ),
    );
    expect(ephemeralFirst.address?.equals(ephemeralSecond.address)).toBeFalsy();
  });
});
