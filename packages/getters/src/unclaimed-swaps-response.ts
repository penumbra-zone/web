import { createGetter } from './utils/create-getter.js';
import { UnclaimedSwapsResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';

export const getUnclaimedSwaps = createGetter(
  (response?: UnclaimedSwapsResponse) => response?.swap,
);
