import { AddressView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb.js';
import { Translator } from './types.js';

export const asOpaqueAddressView: Translator<AddressView> = addressView => {
  if (!addressView) {
    return new AddressView();
  }

  if (addressView.addressView.case === 'opaque') {
    return addressView;
  }

  return new AddressView({
    addressView: {
      case: 'opaque',
      value: addressView.addressView.value ? addressView.addressView.value : {},
    },
  });
};
