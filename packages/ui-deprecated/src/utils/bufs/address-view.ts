import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { addressFromBech32m } from '@penumbra-zone/bech32m/penumbra';

export const ADDRESS_VIEW_DECODED = new AddressView({
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

export const ADDRESS2_VIEW_DECODED = new AddressView({
  addressView: {
    case: 'decoded',
    value: {
      address: { inner: new Uint8Array(80) },
      index: {
        account: 2,
        randomizer: new Uint8Array([0, 0, 0]),
      },
    },
  },
});

export const ADDRESS_VIEW_DECODED_ONE_TIME = new AddressView({
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

export const ADDRESS_VIEW_OPAQUE = new AddressView({
  addressView: {
    case: 'opaque',
    value: {
      address: addressFromBech32m(
        'penumbra1e8k5cyds484dxvapeamwveh5khqv4jsvyvaf5wwxaaccgfghm229qw03pcar3ryy8smptevstycch0qk3uu0rgkvtjpxy3cu3rjd0agawqtlz6erev28a6sg69u7cxy0t02nd4',
      ),
    },
  },
});
