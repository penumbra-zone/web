import { SwapClaimView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb.js';
import { createGetter } from './utils/create-getter.js';
import { getValue } from './note-view.js';

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

export const getOutput1ValueOptional = getOutput1.optional().pipe(getValue);
export const getOutput2ValueOptional = getOutput2.optional().pipe(getValue);

export const getSwapClaimFee = createGetter((swapClaimView?: SwapClaimView) =>
  swapClaimView?.swapClaimView.case === 'visible' || swapClaimView?.swapClaimView.case === 'opaque'
    ? swapClaimView.swapClaimView.value.swapClaim?.body?.fee
    : undefined,
);
