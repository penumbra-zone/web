import { SwapView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { createGetter } from './utils/create-getter';
import { getValue, getValueOpaque } from './note-view';
import {
  getClaimFee,
  getDelta1I,
  getDelta1IOpaque,
  getDelta2I,
  getDelta2IOpaque,
} from './swap-plaintext';

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

export const getClaimFeeFromSwapView = getSwapPlaintext.pipe(getClaimFee);

export const getDelta1IFromSwapView = getSwapPlaintext.pipe(getDelta1I);
export const getDelta2IFromSwapView = getSwapPlaintext.pipe(getDelta2I);

export const getAsset1Metadata = createGetter((swapView?: SwapView) =>
  swapView?.swapView.case === 'visible' ? swapView.swapView.value.asset1Metadata : undefined,
);

export const getAsset2Metadata = createGetter((swapView?: SwapView) =>
  swapView?.swapView.case === 'visible' ? swapView.swapView.value.asset2Metadata : undefined,
);

export const getClaimTx = createGetter((swapView?: SwapView) =>
  swapView?.swapView.case === 'visible' ? swapView.swapView.value.claimTx : undefined,
);

export const getSwapPlaintextOpaque = createGetter((swapView?: SwapView) =>
  swapView?.swapView.case === 'opaque' ? swapView.swapView.value.swap?.body : undefined,
);
export const getDelta1IFromSwapViewOpaque = getSwapPlaintextOpaque.pipe(getDelta1IOpaque);
export const getDelta2IFromSwapViewOpaque = getSwapPlaintextOpaque.pipe(getDelta2IOpaque);

export const getOutput1Opaque = createGetter((swapView?: SwapView) =>
  swapView?.swapView.case === 'opaque' ? swapView.swapView.value.output1Value! : undefined,
);
export const getOutput2Opaque = createGetter((swapView?: SwapView) =>
  swapView?.swapView.case === 'opaque' ? swapView.swapView.value.output2Value : undefined,
);

export const getOutput1ValueOpaqueView = getOutput1Opaque.optional().pipe(getValueOpaque);
export const getOutput1ValueOptionalOpaque = getOutput1Opaque.optional().pipe(getValueOpaque);
export const getOutput2ValueOptionalOpaque = getOutput2Opaque.optional().pipe(getValueOpaque);

export const getAsset1MetadataOpaque = createGetter((swapView?: SwapView) =>
  swapView?.swapView.case === 'opaque' ? swapView.swapView.value.asset1Metadata : undefined,
);

export const getAsset2MetadataOpaque = createGetter((swapView?: SwapView) =>
  swapView?.swapView.case === 'opaque' ? swapView.swapView.value.asset2Metadata : undefined,
);

/**
 * This is a sort of odd getter. It looks in both `output1` and `output2` for
 * the output address. We could get the address from `claimAddress` under the
 * `swapPlaintext` property, but that's just an `Address`, not an `AddressView`,
 * and we want to display the address view because that includes details like
 * the account index.
 */
export const getAddressView = createGetter((swapView?: SwapView) =>
  swapView?.swapView.case === 'visible'
    ? swapView.swapView.value.output1?.address ?? swapView.swapView.value.output2?.address
    : undefined,
);
