import {
  Address,
  AddressView,
  FullViewingKey,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
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
