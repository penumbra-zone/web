import { AddressView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { createGetter } from './utils/create-getter';

export const getAddressIndex = createGetter((addressView?: AddressView) =>
  addressView?.addressView.case === 'decoded' ? addressView.addressView.value.index : undefined,
);

export const getAddress = createGetter(
  (addressView?: AddressView) => addressView?.addressView.value?.address,
);
