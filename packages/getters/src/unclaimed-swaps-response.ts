import { createGetter } from './utils/create-getter.js';
import { UnclaimedSwapsResponse } from '@penumbra-zone/protobuf/types';

export const getUnclaimedSwaps = createGetter(
  (response?: UnclaimedSwapsResponse) => response?.swap,
);
