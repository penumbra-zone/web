import { createGetter } from './utils/create-getter.js';
import { Swap } from '@penumbra-zone/protobuf/types';

export const getCommitment = createGetter((swap?: Swap) => swap?.body?.payload?.commitment);
