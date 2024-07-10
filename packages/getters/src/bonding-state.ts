import { BondingState } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/stake/v1/stake_pb.js';
import { createGetter } from './utils/create-getter.js';

export const getBondingStateEnum = createGetter(
  (bondingState?: BondingState) => bondingState?.state,
);
