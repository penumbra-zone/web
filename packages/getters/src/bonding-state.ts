import { BondingState } from '@penumbra-zone/protobuf/types';
import { createGetter } from './utils/create-getter.js';

export const getBondingStateEnum = createGetter(
  (bondingState?: BondingState) => bondingState?.state,
);
