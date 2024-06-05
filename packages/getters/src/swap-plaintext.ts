import {
  SwapBody,
  SwapPlaintext,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { createGetter } from './utils/create-getter';

export const getDelta1I = createGetter((swapPlaintext?: SwapPlaintext) => swapPlaintext?.delta1I);
export const getDelta2I = createGetter((swapPlaintext?: SwapPlaintext) => swapPlaintext?.delta2I);
export const getClaimFee = createGetter((swapPlaintext?: SwapPlaintext) => swapPlaintext?.claimFee);
export const getDelta1IOpaque = createGetter((swapBody?: SwapBody) => swapBody?.delta1I);
export const getDelta2IOpaque = createGetter((swapBody?: SwapBody) => swapBody?.delta2I);
