import { Address, AddressView, FullViewingKey } from '@penumbra-zone/protobuf/types';
import { getAddressIndexByAddress } from '@penumbra-zone/wasm/address';

export const getAddressView = (address: Address, fullViewingKey: FullViewingKey): AddressView => {
  const index = getAddressIndexByAddress(fullViewingKey, address);

  if (index) {
    return new AddressView({
      addressView: {
        case: 'decoded',
        value: {
          address,
          index,
        },
      },
    });
  } else {
    return new AddressView({
      addressView: {
        case: 'opaque',
        value: {
          address,
        },
      },
    });
  }
};
