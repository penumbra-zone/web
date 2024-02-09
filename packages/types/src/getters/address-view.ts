import {
  AddressIndex,
  AddressView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { createGetter } from './utils/create-getter';

export const getAddressIndex = createGetter<AddressView, AddressIndex>(addressView =>
  addressView?.addressView.case === 'decoded' ? addressView.addressView.value.index : undefined,
);
