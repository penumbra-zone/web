import {
  Address,
  AddressView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { describe, expect, test } from 'vitest';
import { asOpaqueAddressView } from './address-view';

const u8 = (length: number) => Uint8Array.from({ length }, () => Math.floor(Math.random() * 256));

const sameAddress = {
  inner: u8(80),
};

describe('asOpaqueAddressView()', () => {
  describe('when the address view is visible', () => {
    const addressView = new AddressView({
      addressView: {
        case: 'decoded',
        value: {
          address: sameAddress,
          index: {
            account: 0,
          },
          walletId: {
            inner: u8(32),
          },
        },
      },
    });

    test('returns an opaque address view', () => {
      const expected = new AddressView({
        addressView: {
          case: 'opaque',
          value: {
            address: sameAddress,
          },
        },
      });

      expect(asOpaqueAddressView(addressView).equals(expected)).toBe(true);
    });
  });

  describe('when the address view is already opaque', () => {
    const addressView = new AddressView({
      addressView: {
        case: 'opaque',
        value: {
          address: new Address(),
        },
      },
    });

    test('returns the address view as-is', () => {
      expect(asOpaqueAddressView(addressView)).toBe(addressView);
    });
  });

  describe('when the address view is undefined', () => {
    const addressView = undefined;

    test('returns an empty address view', () => {
      expect(asOpaqueAddressView(addressView).equals(new AddressView())).toBe(true);
    });
  });
});
