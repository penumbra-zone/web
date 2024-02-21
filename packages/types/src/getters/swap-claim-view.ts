import { SwapClaimView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { createGetter } from './utils/create-getter';

export const getOutput1 = createGetter((swapClaimView?: SwapClaimView) =>
  swapClaimView?.swapClaimView.case === 'visible'
    ? swapClaimView.swapClaimView.value.output1
    : undefined,
);

export const getOutput2 = createGetter((swapClaimView?: SwapClaimView) =>
  swapClaimView?.swapClaimView.case === 'visible'
    ? swapClaimView.swapClaimView.value.output2
    : undefined,
);
