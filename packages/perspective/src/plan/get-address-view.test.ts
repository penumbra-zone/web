import { beforeEach, describe, expect, test, vi } from 'vitest';
import { create, equals } from '@bufbuild/protobuf';
import { getAddressView } from './get-address-view.js';
import {
  AddressSchema,
  AddressIndexSchema,
  AddressViewSchema,
  FullViewingKeySchema,
} from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { addressFromBech32m } from '@penumbra-zone/bech32m/penumbra';

const mockGetAddressIndexByAddress = vi.hoisted(() => vi.fn());

vi.mock('@penumbra-zone/wasm/address', () => ({
  getAddressIndexByAddress: mockGetAddressIndexByAddress,
}));

describe('getAddressView()', () => {
  const addressAsBech32 =
    'penumbra147mfall0zr6am5r45qkwht7xqqrdsp50czde7empv7yq2nk3z8yyfh9k9520ddgswkmzar22vhz9dwtuem7uxw0qytfpv7lk3q9dp8ccaw2fn5c838rfackazmgf3ahh09cxmz';
  const address = create(AddressSchema, addressFromBech32m(addressAsBech32));

  beforeEach(() => {
    mockGetAddressIndexByAddress.mockReset();
  });

  describe('when the address is controlled by the user represented by the full viewing key', () => {
    beforeEach(() => {
      mockGetAddressIndexByAddress.mockImplementation(() =>
        create(AddressIndexSchema, { account: 123 }),
      );
    });

    test('returns a visible `AddressView`', () => {
      const expected = create(AddressViewSchema, {
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

      expect(
        equals(AddressViewSchema, expected, getAddressView(address, create(FullViewingKeySchema))),
      ).toBe(true);
    });
  });

  describe('when the address is not controlled by the user represented by the full viewing key', () => {
    beforeEach(() => {
      mockGetAddressIndexByAddress.mockImplementation(() => undefined);
    });

    test('returns an opaque `AddressView`', () => {
      const expected = create(AddressViewSchema, {
        addressView: {
          case: 'opaque',
          value: {
            address,
          },
        },
      });

      expect(
        equals(AddressViewSchema, expected, getAddressView(address, create(FullViewingKeySchema))),
      ).toBe(true);
    });
  });
});
