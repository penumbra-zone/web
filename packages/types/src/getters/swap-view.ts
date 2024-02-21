import { SwapView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { createGetter } from './utils/create-getter';

export const getBatchSwapOutputData = createGetter((swapView?: SwapView) =>
  swapView?.swapView.case === 'visible' ? swapView.swapView.value.batchSwapOutputData : undefined,
);

export const getSwapPlaintext = createGetter((swapView?: SwapView) =>
  swapView?.swapView.case === 'visible' ? swapView.swapView.value.swapPlaintext : undefined,
);
