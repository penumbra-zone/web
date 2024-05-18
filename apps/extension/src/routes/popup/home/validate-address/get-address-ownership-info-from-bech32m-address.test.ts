import { Mock, describe, expect, it, vi } from 'vitest';
import { getAddressOwnershipInfoFromBech32mAddress } from './get-address-ownership-info-from-bech32m-address';
import { IndexByAddressResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';

const ADDRESS =
  'penumbra10t0nt9nfd40sgs7v6gshyescnh4j650vc255uwxmmtkt7fzmelmfxn0sqxjvde7xkhv3zr63sa2pja62kmyscw386lluvvkf2y3a8flf69mhg29zkyg7tg9ey8spqp5mw5uhl6';

const mockIndexByAddress: Mock = vi.hoisted(() => vi.fn());

vi.mock('../../../../clients', () => ({
  viewClient: { indexByAddress: mockIndexByAddress },
}));

describe('getAddressOwnershipInfoFromBech32mAddress()', () => {
  it('returns undefined if the RPC method throws (because the address is invalid)', async () => {
    mockIndexByAddress.mockImplementation(() => {
      throw new Error('oops');
    });

    await expect(getAddressOwnershipInfoFromBech32mAddress(ADDRESS)).resolves.toBeUndefined();
  });

  it('indicates a controlled address if the RPC method returns an address index', async () => {
    mockIndexByAddress.mockResolvedValue(
      new IndexByAddressResponse({
        addressIndex: { account: 1234, randomizer: new Uint8Array([]) },
      }),
    );

    await expect(getAddressOwnershipInfoFromBech32mAddress(ADDRESS)).resolves.toEqual({
      belongsToWallet: true,
      addressIndexAccount: 1234,
      isEphemeral: false,
    });
  });

  it('indicates a controlled IBC address if the RPC method returns an address index with a populated randomizer', async () => {
    mockIndexByAddress.mockResolvedValue(
      new IndexByAddressResponse({
        addressIndex: { account: 5678, randomizer: new Uint8Array([0, 1, 2, 3]) },
      }),
    );

    await expect(getAddressOwnershipInfoFromBech32mAddress(ADDRESS)).resolves.toEqual({
      belongsToWallet: true,
      addressIndexAccount: 5678,
      isEphemeral: true,
    });
  });

  it('indicates a non-controlled address if the RPC method returns no address index', async () => {
    mockIndexByAddress.mockResolvedValue(new IndexByAddressResponse());

    await expect(getAddressOwnershipInfoFromBech32mAddress(ADDRESS)).resolves.toEqual({
      belongsToWallet: false,
    });
  });
});
