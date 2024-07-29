import { DelegationsByAddressIndexResponse } from '@penumbra-zone/protobuf/types';
import { createGetter } from './utils/create-getter.js';

export const getValueView = createGetter(
  (delegationsByAddressIndexResponse?: DelegationsByAddressIndexResponse) =>
    delegationsByAddressIndexResponse?.valueView,
);
