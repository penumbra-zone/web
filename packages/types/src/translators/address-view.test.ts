import {
  Address,
  AddressView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { describe, expect, test } from 'vitest';
import { asOpaqueAddressView } from './address-view';

describe('asOpaqueAddressView()', () => {
  describe('when the address view is visible', () => {
    const addressView = new AddressView({
      addressView: {
        case: 'visible',
        value: {
          address: {
            inner: Uint8Array.from([0, 1, 2, 3]),
          },
          index: {
            account: 0,
          },
          walletId: {
            inner: Uint8Array.from([4, 5, 6, 7]),
          },
        },
      },
    });

    test('returns an opaque address view', () => {
      const expected = new AddressView({
        addressView: {
          case: 'opaque',
          value: {
            address: {
              inner: Uint8Array.from([0, 1, 2, 3]),
            },
          },
        },
      });

      expect(asOpaqueAddressView(addressView)!.equals(expected)).toBe(true);
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
