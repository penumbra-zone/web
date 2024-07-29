import { UnbondingTokensByAddressIndexResponse } from '@penumbra-zone/protobuf/types';
import { createGetter } from './utils/create-getter.js';

export const getValueView = createGetter(
  (unbondingTokensByAddressIndexResponse?: UnbondingTokensByAddressIndexResponse) =>
    unbondingTokensByAddressIndexResponse?.valueView,
);
