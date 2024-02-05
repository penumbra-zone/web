import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getAddressView } from './get-address-view';
import {
  Address,
  AddressIndex,
  AddressView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { bech32ToUint8Array } from '@penumbra-zone/types';

const mockIsControlledAddress = vi.hoisted(() => vi.fn());

vi.mock('@penumbra-zone/wasm-ts', () => ({
  isControlledAddress: mockIsControlledAddress,
}));

describe('getAddressView()', () => {
  const addressAsBech32 =
    'penumbra147mfall0zr6am5r45qkwht7xqqrdsp50czde7empv7yq2nk3z8yyfh9k9520ddgswkmzar22vhz9dwtuem7uxw0qytfpv7lk3q9dp8ccaw2fn5c838rfackazmgf3ahh09cxmz';
  const address = new Address({ inner: bech32ToUint8Array(addressAsBech32) });

  beforeEach(() => {
    mockIsControlledAddress.mockReset();
  });

  describe('when the address is controlled by the user represented by the full viewing key', () => {
    beforeEach(() => {
      mockIsControlledAddress.mockImplementation(() => new AddressIndex({ account: 123 }));
    });

    test('returns a visible `AddressView`', () => {
      const expected = new AddressView({
        addressView: {
          case: 'decoded',
          value: {
            address,
            index: {
              account: 123,
            },
          },
        },
      });

      expect(getAddressView(address, 'fvk').equals(expected)).toBe(true);
    });
  });

  describe('when the address is not controlled by the user represented by the full viewing key', () => {
    beforeEach(() => {
      mockIsControlledAddress.mockImplementation(() => undefined);
    });

    test('returns an opaque `AddressView`', () => {
      const expected = new AddressView({
        addressView: {
          case: 'opaque',
          value: {
            address,
          },
        },
      });

      expect(getAddressView(address, 'fvk').equals(expected)).toBe(true);
    });
  });
});
