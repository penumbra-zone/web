import {
  Address,
  AddressView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { isControlledAddress } from '@penumbra-zone/wasm/src/address';
import { bech32Address } from '@penumbra-zone/bech32/src/address';

export const getAddressView = (address: Address, fullViewingKey: string): AddressView => {
  const index = isControlledAddress(fullViewingKey, bech32Address(address));

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
