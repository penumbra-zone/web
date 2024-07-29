import { createGetter } from './utils/create-getter.js';
import { TradingPair } from '@penumbra-zone/protobuf/types';

export const getAsset1 = createGetter((pair?: TradingPair) => pair?.asset1);
export const getAsset2 = createGetter((pair?: TradingPair) => pair?.asset2);
