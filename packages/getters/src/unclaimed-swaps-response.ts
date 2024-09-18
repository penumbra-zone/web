import { createGetter } from './utils/create-getter.js';
import { UnclaimedSwapsResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

export const getUnclaimedSwaps = createGetter(
  (response?: UnclaimedSwapsResponse) => response?.swap,
);
