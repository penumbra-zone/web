import {
  Address,
  AddressView,
  AddressViewSchema,
  FullViewingKey,
} from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { create } from '@bufbuild/protobuf';
import { getAddressIndexByAddress } from '@penumbra-zone/wasm/address';

export const getAddressView = (address: Address, fullViewingKey: FullViewingKey): AddressView => {
  const index = getAddressIndexByAddress(fullViewingKey, address);

  if (index) {
    return create(AddressViewSchema, {
      addressView: {
        case: 'decoded',
        value: {
          address,
          index,
        },
      },
    });
  } else {
    return create(AddressViewSchema, {
      addressView: {
        case: 'opaque',
        value: {
          address,
        },
      },
    });
  }
};
