import { createGetter } from './utils/create-getter';
import { SwapRecord } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { getAsset1, getAsset2 } from './trading-pair';

export const getSwapRecordCommitment = createGetter((swap?: SwapRecord) => swap?.swapCommitment);
export const getTradingPair = createGetter((s?: SwapRecord) => s?.swap?.tradingPair);
export const getSwapAsset1 = getTradingPair.pipe(getAsset1);
export const getSwapAsset2 = getTradingPair.pipe(getAsset2);
