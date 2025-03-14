import { AddressViewSchema } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { create } from '@bufbuild/protobuf';
import { addressFromBech32m } from '@penumbra-zone/bech32m/penumbra';

export const ADDRESS_VIEW_DECODED = create(AddressViewSchema, {
  addressView: {
    case: 'decoded',
    value: {
      address: { inner: new Uint8Array(80) },
      index: {
        account: 0,
        randomizer: new Uint8Array([0, 0, 0]),
      },
    },
  },
});

export const ADDRESS1_VIEW_DECODED = create(AddressViewSchema, {
  addressView: {
    case: 'decoded',
    value: {
      address: { inner: new Uint8Array(80) },
      index: {
        account: 1,
        randomizer: new Uint8Array([0, 0, 0]),
      },
    },
  },
});

export const ADDRESS_VIEW_DECODED_ONE_TIME = create(AddressViewSchema, {
  addressView: {
    case: 'decoded',
    value: {
      address: { inner: new Uint8Array(80) },
      index: {
        account: 0,
        // A one-time address is defined by a randomizer with at least one
        // non-zero byte.
        randomizer: new Uint8Array([1, 2, 3]),
      },
    },
  },
});

export const ADDRESS_VIEW_OPAQUE = create(AddressViewSchema, {
  addressView: {
    case: 'opaque',
    value: {
      address: addressFromBech32m(
        'penumbra1e8k5cyds484dxvapeamwveh5khqv4jsvyvaf5wwxaaccgfghm229qw03pcar3ryy8smptevstycch0qk3uu0rgkvtjpxy3cu3rjd0agawqtlz6erev28a6sg69u7cxy0t02nd4',
      ),
    },
  },
});

export const ADDRESS_VIEW_EXTERNAL = create(AddressViewSchema, {
  addressView: {
    case: 'opaque',
    value: {
      address: {
        altBech32m: 'osmo112131243124213412',
      },
    },
  },
});
