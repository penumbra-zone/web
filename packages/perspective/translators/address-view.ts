import { AddressView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { Translator } from './types';

export const asOpaqueAddressView: Translator<AddressView> = addressView => {
  if (!addressView) return new AddressView();

  if (addressView.addressView.case === 'opaque') return addressView;

  return new AddressView({
    addressView: {
      case: 'opaque',
      value: addressView.addressView.value ? addressView.addressView.value : {},
    },
  });
};
