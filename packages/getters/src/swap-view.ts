import {
  SwapBody,
  SwapPlaintext,
  SwapView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { createGetter } from './utils/create-getter';

// Generic getter function for 'Output1'
export const getOutput1Value = createGetter((swapView?: SwapView) => {
  switch (swapView?.swapView.case) {
    case 'visible':
      return swapView.swapView.value.output1?.value;
    case 'opaque':
      return swapView.swapView.value.output1Value;
    default:
      return undefined;
  }
});

// Generic getter function for 'Output2'
export const getOutput2Value = createGetter((swapView?: SwapView) => {
  switch (swapView?.swapView.case) {
    case 'visible':
      return swapView.swapView.value.output2?.value;
    case 'opaque':
      return swapView.swapView.value.output2Value;
    default:
      return undefined;
  }
});

// Generic getter function that returns the value of a specified property from either 'swapPlaintext' or 'swapBody'.
// This pattern utilizes parameterized types, 'T', to handle property access, 'K' within different nested objects based on the case
// of 'SwapView'. These parameterized types can represent an intersection of multiple types.
type SwapBodyCombined = SwapPlaintext & SwapBody;
const createSwapGetter = <K extends keyof SwapBodyCombined>(property: K) => {
  return createGetter((swapView?: SwapView) => {
    let swapValue: SwapBodyCombined[K] | undefined;

    switch (swapView?.swapView.case) {
      case 'visible':
        swapValue = swapView.swapView.value.swapPlaintext?.[property as keyof SwapPlaintext] as
          | SwapBodyCombined[K]
          | undefined;
        break;
      case 'opaque':
        swapValue = swapView.swapView.value.swap?.body?.[property as keyof SwapBody] as
          | SwapBodyCombined[K]
          | undefined;
        break;
      default:
        return undefined;
    }

    if (swapValue === undefined) {
      return undefined;
    }

    return swapValue;
  });
};

// Generic getter function for 'delta1I'
export const getDelta1IFromSwapView = createSwapGetter<'delta1I'>('delta1I');

// Generic getter function for 'delta2I'
export const getDelta2IFromSwapView = createSwapGetter<'delta2I'>('delta2I');

// Generic getter function for 'claimFee'
export const getClaimFeeFromSwapView = createSwapGetter<'claimFee'>('claimFee');

// Generic getter function for 'Asset1Metadata'
export const getAsset1Metadata = createGetter((swapView?: SwapView) =>
  swapView?.swapView.case === 'visible' || swapView?.swapView.case === 'opaque'
    ? swapView.swapView.value.asset1Metadata
    : undefined,
);

// Generic getter function for 'Asset2Metadata'
export const getAsset2Metadata = createGetter((swapView?: SwapView) =>
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
