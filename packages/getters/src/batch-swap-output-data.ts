import { BatchSwapOutputData } from '@penumbra-zone/protobuf/types';
import { createGetter } from './utils/create-getter.js';
import { getAsset1, getAsset2 } from './trading-pair.js';

export const getTradingPair = createGetter((b?: BatchSwapOutputData) => b?.tradingPair);
export const getSwapAsset1 = getTradingPair.pipe(getAsset1);
export const getSwapAsset2 = getTradingPair.pipe(getAsset2);

export const getDelta1Amount = createGetter((b?: BatchSwapOutputData) => b?.delta1);
export const getDelta2Amount = createGetter((b?: BatchSwapOutputData) => b?.delta2);
export const getLambda1Amount = createGetter((b?: BatchSwapOutputData) => b?.lambda1);
export const getLambda2Amount = createGetter((b?: BatchSwapOutputData) => b?.lambda2);
export const getUnfilled1Amount = createGetter((b?: BatchSwapOutputData) => b?.unfilled1);
export const getUnfilled2Amount = createGetter((b?: BatchSwapOutputData) => b?.unfilled2);
