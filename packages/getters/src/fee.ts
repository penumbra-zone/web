import { createGetter } from './utils/create-getter.js';
import { Fee } from '@penumbra-zone/protobuf/penumbra/core/component/fee/v1/fee_pb';

export const getAmount = createGetter((fee?: Fee) => fee?.amount);
