import { Fee } from '@penumbra-zone/protobuf/types';
import { createGetter } from './utils/create-getter.js';

export const getAmount = createGetter((fee?: Fee) => fee?.amount);
