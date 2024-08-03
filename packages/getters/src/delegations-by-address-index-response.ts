import { DelegationsByAddressIndexResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { createGetter } from './utils/create-getter.js';

export const getValueView = createGetter(
  (delegationsByAddressIndexResponse?: DelegationsByAddressIndexResponse) =>
    delegationsByAddressIndexResponse?.valueView,
);
