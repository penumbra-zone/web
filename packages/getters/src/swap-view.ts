import { SwapView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { createGetter } from './utils/create-getter';
import { getValue } from './note-view';
import { getDelta1I, getDelta2I } from './swap-plaintext';

export const getOutput1 = createGetter((swapView?: SwapView) =>
  swapView?.swapView.case === 'visible' ? swapView.swapView.value.output1 : undefined,
);
export const getOutput1Value = getOutput1.pipe(getValue);
export const getOutput1ValueOptional = getOutput1.optional().pipe(getValue);

export const getOutput2 = createGetter((swapView?: SwapView) =>
  swapView?.swapView.case === 'visible' ? swapView.swapView.value.output2 : undefined,
);
export const getOutput2Value = getOutput2.pipe(getValue);
export const getOutput2ValueOptional = getOutput2.optional().pipe(getValue);

export const getSwapPlaintext = createGetter((swapView?: SwapView) =>
  swapView?.swapView.case === 'visible' ? swapView.swapView.value.swapPlaintext : undefined,
);

export const getDelta1IFromSwapView = getSwapPlaintext.pipe(getDelta1I);
export const getDelta2IFromSwapView = getSwapPlaintext.pipe(getDelta2I);

export const getAsset1Metadata = createGetter((swapView?: SwapView) =>
  swapView?.swapView.case === 'visible' ? swapView.swapView.value.asset1Metadata : undefined,
);

export const getAsset2Metadata = createGetter((swapView?: SwapView) =>
  swapView?.swapView.case === 'visible' ? swapView.swapView.value.asset2Metadata : undefined,
);
