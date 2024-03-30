import {
  getAsset1Metadata,
  getAsset2Metadata,
  getDelta1IFromSwapView,
  getDelta2IFromSwapView,
  getOutput1Value,
  getOutput1ValueOptional,
  getOutput2Value,
  getOutput2ValueOptional,
} from '@penumbra-zone/getters/src/swap-view';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { SwapView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { isZero } from './amount';
import { getAmount } from '@penumbra-zone/getters/src/value-view';

/**
 * Swaps can go in either direction in Penumbra, and can even go in both
 * directions at the same time -- i.e., a swap action can swap some of asset A
 * for asset B and some of asset B for asset A in the same Swap action. Of
 * course, there is probably no good reason to ever do this, so Penumbra code
 * will never build these transactions. That said, we have to support the
 * possibility that other clients will create such transactions; so, here, we
 * check whether a swap is a one-way swap by checking that at least one of its
 * inputs is zero.
 */
export const isOneWaySwap = (swapView: SwapView) => {
  const delta1I = getDelta1IFromSwapView(swapView);
  const delta2I = getDelta2IFromSwapView(swapView);

  return isZero(delta1I) || isZero(delta2I);
};

/**
 * Given a one-way swap, returns the amount that was unfilled, or `undefined`.
 */
const getUnfilledAmount = (swapView: SwapView): ValueView | undefined => {
  const delta1I = getDelta1IFromSwapView(swapView);
  const delta2I = getDelta2IFromSwapView(swapView);

  const output1Value = getOutput1Value(swapView);
  const output2Value = getOutput2Value(swapView);

  const is1To2Swap = isZero(delta2I);
  const is2To1Swap = isZero(delta1I);

  if (is1To2Swap && !isZero(getAmount(output1Value))) return output1Value;
  if (is2To1Swap && !isZero(getAmount(output2Value))) return output2Value;

  return undefined;
};

/**
 * Returns an object describing a swap: its input, its output, and any unfilled
 * amount. This function is useful for displaying a swap in a UI, and it assumes
 * we're dealing with a one-way swap. If passed a two-way swap, it will throw.
 */
export const getOneWaySwapValues = (
  swapView: SwapView,
): {
  input: ValueView;
  output: ValueView;
  unfilled?: ValueView;
} => {
  if (!isOneWaySwap(swapView)) {
    throw new Error(
      'Attempted to get one-way swap values from a two-way swap. `getOneWaySwapValues()` should only be called with a `SwapView` containing a one-way swap -- that is, a swap with at least one `swapPlaintext.delta*` that has an amount equal to zero.',
    );
  }

  const output1 = getOutput1ValueOptional(swapView);
  const output2 = getOutput2ValueOptional(swapView);

  const delta1I = getDelta1IFromSwapView(swapView);
  const delta2I = getDelta2IFromSwapView(swapView);

  const input = new ValueView({
    valueView: {
      case: 'knownAssetId',
      value: {
        amount: isZero(delta2I) ? delta1I : delta2I,
        metadata: isZero(delta2I) ? getAsset1Metadata(swapView) : getAsset2Metadata(swapView),
      },
    },
  });

  let output = isZero(delta2I) ? output2 : output1;

  if (!output) {
    output = new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: {
          metadata: isZero(delta2I) ? getAsset1Metadata(swapView) : getAsset2Metadata(swapView),
        },
      },
    });
  }

  return {
    input,
    output,
    unfilled: getUnfilledAmount(swapView),
  };
};
