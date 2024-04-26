import { createGetter } from './utils/create-getter';
import { Fee } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1/fee_pb';

export const getAmount = createGetter((fee?: Fee) => fee?.amount);
