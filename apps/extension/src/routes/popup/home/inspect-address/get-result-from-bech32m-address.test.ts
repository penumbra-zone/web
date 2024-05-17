import { Mock, describe, expect, it, vi } from 'vitest';
import { getResultFromBech32mAddress } from './get-result-from-bech32m-address';
import {
  IndexByAddressRequest,
  IndexByAddressResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';

const INVALID = 'invalid';
const CONTROLLED_ADDRESS =
  'penumbra1u8eg9v2dlge3yd7gjkdmnzj3quvgwy204ueryl0uzxpjjpan4fwkjwd8mlrkpfffe6vuweeq0x7wn3rhljj7qaedye4kuhpj9fmcu4zl0cn6up0syg60hrc70x9edf2gy0shft';
const CONTROLLED_ADDRESS_IBC =
  'penumbra10t0nt9nfd40sgs7v6gshyescnh4j650vc255uwxmmtkt7fzmelmfxn0sqxjvde7xkhv3zr63sa2pja62kmyscw386lluvvkf2y3a8flf69mhg29zkyg7tg9ey8spqp5mw5uhl6';
const NON_CONTROLLED_ADDRESS =
  'penumbra1g90kg9ethsluk53tq98guf3znnalaa484j43w7a8s4m6apvjjahv3syk9hmrjdc2qt29vn8qc6jzjcuz2kln89c07fj5e4f6f302s79hup75kh2867drz406udyw6w0fygkkjy';

const mockIndexByAddress: Mock = vi.hoisted(() =>
  vi.fn((request: IndexByAddressRequest) => {
    switch (request.address?.altBech32m) {
      case INVALID:
        throw new Error('invalid');

      case CONTROLLED_ADDRESS:
        return Promise.resolve(
          new IndexByAddressResponse({
            addressIndex: { account: 1234, randomizer: new Uint8Array([]) },
          }),
        );

      case CONTROLLED_ADDRESS_IBC:
        return Promise.resolve(
          new IndexByAddressResponse({
            addressIndex: { account: 5678, randomizer: new Uint8Array([0, 1, 2, 3]) },
          }),
        );

      default:
        return Promise.resolve(new IndexByAddressResponse());
    }
  }),
);

vi.mock('../../../../clients', () => ({
  viewClient: {
    indexByAddress: mockIndexByAddress,
  },
}));

describe('getResultFromBech32mAddress()', () => {
  it('returns undefined if the the RPC method throws (because the address is invalid)', async () => {
    await expect(getResultFromBech32mAddress(INVALID)).resolves.toBeUndefined();
  });

  it('indicates a controlled address if the the RPC method returns an address index', async () => {
    await expect(getResultFromBech32mAddress(CONTROLLED_ADDRESS)).resolves.toEqual({
      belongsToWallet: true,
      addressIndexAccount: 1234,
      ibc: false,
    });
  });

  it('indicates a controlled IBC address if the the RPC method returns an address index with a populated randomizer', async () => {
    await expect(getResultFromBech32mAddress(CONTROLLED_ADDRESS_IBC)).resolves.toEqual({
      belongsToWallet: true,
      addressIndexAccount: 5678,
      ibc: true,
    });
  });

  it('indicates a non-controlled address if the the RPC method returns no address index', async () => {
    await expect(getResultFromBech32mAddress(NON_CONTROLLED_ADDRESS)).resolves.toEqual({
      belongsToWallet: false,
    });
  });
});
