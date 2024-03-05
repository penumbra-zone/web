import { createGetter } from './utils/create-getter';
import { TradingPair } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';

export const getAsset1 = createGetter((pair?: TradingPair) => pair?.asset1);
export const getAsset2 = createGetter((pair?: TradingPair) => pair?.asset2);
