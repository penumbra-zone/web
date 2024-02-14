import { createGetter } from './utils/create-getter';
import { UnclaimedSwapsResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';

export const getUnclaimedSwaps = createGetter(
  (response?: UnclaimedSwapsResponse) => response?.swap,
);
