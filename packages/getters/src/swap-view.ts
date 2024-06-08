import {
  SwapBody,
  SwapPlaintext,
  SwapView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { createGetter } from './utils/create-getter';
import { getGenericValue } from './note-view';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';

// Generic getter function for 'Output1'
export const getOutput1Generic = createGetter((swapView?: SwapView) => {
  if (!swapView) return undefined;

  switch (swapView.swapView.case) {
    case 'visible':
      return swapView.swapView.value.output1!;
    case 'opaque':
      return swapView.swapView.value.output1Value!;
    default:
      return undefined;
  }
});
export const getOutput1ValueGeneric = getOutput1Generic.pipe(getGenericValue);
export const getOutput1ValueOptionalGeneric = getOutput1Generic.optional().pipe(getGenericValue);

// Generic getter function for 'Output2'
export const getOutput2Generic = createGetter((swapView?: SwapView) => {
  if (!swapView) return undefined;

  switch (swapView.swapView.case) {
    case 'visible':
      return swapView.swapView.value.output2;
    case 'opaque':
      return swapView.swapView.value.output2Value;
    default:
      return undefined;
  }
});
export const getOutput2ValueGeneric = getOutput2Generic.pipe(getGenericValue);
export const getOutput2ValueOptionalGeneric = getOutput2Generic.optional().pipe(getGenericValue);

// Generic getter function for 'SwapPlaintext' and 'SwapBody' within SwapView
const createSwapGetter = <T>(property: keyof T) => {
  return createGetter((swapView?: SwapView) => {
    if (!swapView) return undefined;

    switch (swapView.swapView.case) {
      case 'visible':
        return swapView.swapView.value.swapPlaintext?.[property as keyof SwapPlaintext] as Amount;
      case 'opaque':
        return swapView.swapView.value.swap?.body?.[property as keyof SwapBody] as Amount;
      default:
        return undefined;
    }
  });
};

// Specific getters using the combined generic function
export const getDelta1IFromSwapViewGeneric = createSwapGetter<SwapPlaintext & SwapBody>('delta1I');
export const getDelta2IFromSwapViewGeneric = createSwapGetter<SwapPlaintext & SwapBody>('delta2I');
export const getClaimFeeFromSwapViewGeneric = createSwapGetter<SwapPlaintext>('claimFee');

// Generic getter function for 'Asset1Metadata'
export const getAsset1MetadataGeneric = createGetter((swapView?: SwapView) =>
  swapView?.swapView.case === 'visible' || swapView?.swapView.case === 'opaque'
    ? swapView.swapView.value.asset1Metadata
    : undefined,
);

// Generic getter function for 'Asset2Metadata'
export const getAsset2MetadataGeneric = createGetter((swapView?: SwapView) =>
  swapView?.swapView.case === 'visible' || swapView?.swapView.case === 'opaque'
    ? swapView.swapView.value.asset2Metadata
    : undefined,
);

// Getter function for 'ClaimTx'
export const getClaimTx = createGetter((swapView?: SwapView) =>
  swapView?.swapView.case === 'visible' ? swapView.swapView.value.claimTx : undefined,
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
