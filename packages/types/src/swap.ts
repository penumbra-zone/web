import {
  getAsset1MetadataGeneric,
  getAsset2MetadataGeneric,
  getDelta1IFromSwapViewGeneric,
  getDelta2IFromSwapViewGeneric,
  getOutput1ValueOptionalGeneric,
  getOutput2ValueOptionalGeneric,
} from '@penumbra-zone/getters/swap-view';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { SwapView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { isZero } from './amount';
import { getAmount } from '@penumbra-zone/getters/value-view';

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
export const isOneWaySwapGeneric = (swapView: SwapView) => {
  const delta1I = getDelta1IFromSwapViewGeneric(swapView);
  const delta2I = getDelta2IFromSwapViewGeneric(swapView);

  return isZero(delta1I) || isZero(delta2I);
};

/**
 * Given a one-way swap, returns the amount that was unfilled, or `undefined`.
 */
const getUnfilledAmount = (swapView: SwapView): ValueView | undefined => {
  const delta1I = getDelta1IFromSwapViewGeneric(swapView);
  const delta2I = getDelta2IFromSwapViewGeneric(swapView);

  const output1Value = getOutput1ValueOptionalGeneric(swapView);
  const output2Value = getOutput2ValueOptionalGeneric(swapView);

  const is1To2Swap = isZero(delta2I);
  const is2To1Swap = isZero(delta1I);

  if (is1To2Swap && output1Value && !isZero(getAmount(output1Value as ValueView)))
    return output1Value as ValueView;
  if (is2To1Swap && output2Value && !isZero(getAmount(output2Value as ValueView)))
    return output2Value as ValueView;

  return undefined;
};

/**
 * Returns an object describing a swap: its input, its output, and any unfilled
 * amount. This function is useful for displaying a swap in a UI, and it assumes
 * we're dealing with a one-way swap. If passed a two-way swap, it will throw.
 */
export const getOneWaySwapValuesGeneric = (
  swapView: SwapView,
): {
  input: ValueView;
  output: ValueView;
  unfilled?: ValueView;
} => {
  if (!isOneWaySwapGeneric(swapView)) {
    throw new Error(
      'Attempted to get one-way swap values from a two-way swap. `getOneWaySwapValues()` should only be called with a `SwapView` containing a one-way swap -- that is, a swap with at least one `swapPlaintext.delta*` that has an amount equal to zero.',
    );
  }

  const output1 = getOutput1ValueOptionalGeneric(swapView);
  const output2 = getOutput2ValueOptionalGeneric(swapView);

  const delta1I = getDelta1IFromSwapViewGeneric(swapView);
  const delta2I = getDelta2IFromSwapViewGeneric(swapView);

  const input = new ValueView({
    valueView: {
      case: 'knownAssetId',
      value: {
        amount: isZero(delta2I) ? delta1I : delta2I,
        metadata: isZero(delta2I)
          ? getAsset1MetadataGeneric(swapView)
          : getAsset2MetadataGeneric(swapView),
      },
    },
  });

  let output = (isZero(delta2I) ? output2 : output1) as ValueView;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!output) {
    output = new ValueView({
      valueView: {
        case: 'knownAssetId',
        value: {
          metadata: isZero(delta2I)
            ? getAsset2MetadataGeneric(swapView)
            : getAsset1MetadataGeneric(swapView),
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
