import {
  AddressSchema,
  AddressViewSchema,
} from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { create, equals } from '@bufbuild/protobuf';
import { describe, expect, test } from 'vitest';
import { asOpaqueAddressView } from './address-view.js';

const u8 = (length: number) => Uint8Array.from({ length }, () => Math.floor(Math.random() * 256));

const sameAddress = {
  inner: u8(80),
};

describe('asOpaqueAddressView()', () => {
  describe('when the address view is visible', () => {
    const addressView = create(AddressViewSchema, {
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
      const expected = create(AddressViewSchema, {
        addressView: {
          case: 'opaque',
          value: {
            address: sameAddress,
          },
        },
      });

      expect(equals(AddressViewSchema, asOpaqueAddressView(addressView), expected)).toBe(true);
    });
  });

  describe('when the address view is already opaque', () => {
    const addressView = create(AddressViewSchema, {
      addressView: {
        case: 'opaque',
        value: {
          address: create(AddressSchema),
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
      expect(
        equals(AddressViewSchema, asOpaqueAddressView(addressView), create(AddressViewSchema)),
      ).toBe(true);
    });
  });
});
