import { createGetter } from './utils/create-getter.js';
import { SwapRecord } from '@penumbra-zone/protobuf/types';
import { getAsset1, getAsset2 } from './trading-pair.js';

export const getSwapRecordCommitment = createGetter((swap?: SwapRecord) => swap?.swapCommitment);
export const getTradingPair = createGetter((s?: SwapRecord) => s?.swap?.tradingPair);
export const getSwapAsset1 = getTradingPair.pipe(getAsset1);
export const getSwapAsset2 = getTradingPair.pipe(getAsset2);
