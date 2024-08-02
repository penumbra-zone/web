import { BondingState } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import { createGetter } from './utils/create-getter.js';

export const getBondingStateEnum = createGetter(
  (bondingState?: BondingState) => bondingState?.state,
);
