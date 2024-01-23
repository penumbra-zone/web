import {
  Address,
  AddressView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { bech32Address } from '@penumbra-zone/types';
import { isControlledAddress } from '@penumbra-zone/wasm-ts';

export const getAddressView = (address: Address, fullViewingKey: string): AddressView => {
  const index = isControlledAddress(fullViewingKey, bech32Address(address));

  if (index) {
    return new AddressView({
      addressView: {
        case: 'visible',
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
