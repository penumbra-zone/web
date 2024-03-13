import { DelegationsByAddressIndexResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { createGetter } from './utils/create-getter';

export const getValueView = createGetter(
  (delegationsByAddressIndexResponse?: DelegationsByAddressIndexResponse) =>
    delegationsByAddressIndexResponse?.valueView,
);
