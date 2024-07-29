import { AddressView } from '@penumbra-zone/protobuf/types';
import { createGetter } from './utils/create-getter.js';

export const getAddressIndex = createGetter((addressView?: AddressView) =>
  addressView?.addressView.case === 'decoded' ? addressView.addressView.value.index : undefined,
);

export const getAddress = createGetter(
  (addressView?: AddressView) => addressView?.addressView.value?.address,
);
