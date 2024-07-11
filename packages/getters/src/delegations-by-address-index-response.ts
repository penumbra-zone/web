import { DelegationsByAddressIndexResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';
import { createGetter } from './utils/create-getter.js';

export const getValueView = createGetter(
  (delegationsByAddressIndexResponse?: DelegationsByAddressIndexResponse) =>
    delegationsByAddressIndexResponse?.valueView,
);
