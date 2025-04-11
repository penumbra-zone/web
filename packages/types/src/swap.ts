import {
  getAsset1Metadata,
  getAsset2Metadata,
  getDelta1IFromSwapView,
  getDelta2IFromSwapView,
  getOutput1Value,
  getOutput2Value,
  getTradingPair,
} from '@penumbra-zone/getters/swap-view';
import {
  Metadata,
  AssetId,
  Denom,
  ValueView,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { SwapView } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { isZero } from './amount.js';
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

  const output1Value = getOutput1Value.optional(swapView);
  const output2Value = getOutput2Value.optional(swapView);

  const is1To2Swap = isZero(delta2I);
  const is2To1Swap = isZero(delta1I);

  if (is1To2Swap && output1Value && !isZero(getAmount(output1Value))) {
    return output1Value;
  }
  if (is2To1Swap && output2Value && !isZero(getAmount(output2Value))) {
    return output2Value;
  }

  return undefined;
};

/**
 * Returns an object describing a swap: its input, its output, and any unfilled
 * amount. This function is useful for displaying a swap in a UI, and it assumes
 * we're dealing with a one-way swap. If passed a two-way swap, it will throw.
 */
export const getOneWaySwapValues = (
  swapView: SwapView,
  getMetadata?: (id: AssetId | Denom) => Metadata | undefined,
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

  const output1 = getOutput1Value.optional(swapView);
  const output2 = getOutput2Value.optional(swapView);

  const delta1I = getDelta1IFromSwapView(swapView);
  const delta2I = getDelta2IFromSwapView(swapView);

  const tradingPair = getTradingPair.optional(swapView);
  const metadata1 =
    getAsset1Metadata.optional(swapView) ??
    (tradingPair?.asset1 && getMetadata?.(tradingPair.asset1));
  const metadata2 =
    getAsset2Metadata.optional(swapView) ??
    (tradingPair?.asset2 && getMetadata?.(tradingPair.asset2));

  const inputMetadata = isZero(delta2I) ? metadata1 : metadata2;
  const outputMetadata = isZero(delta2I) ? metadata2 : metadata1;

  const input = inputMetadata
    ? new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            amount: isZero(delta2I) ? delta1I : delta2I,
            metadata: inputMetadata,
          },
        },
      })
    : new ValueView({
        valueView: {
          case: 'unknownAssetId',
          value: {
            amount: isZero(delta2I) ? delta1I : delta2I,
            assetId: isZero(delta2I) ? tradingPair?.asset1 : tradingPair?.asset2,
          },
        },
      });

  let output = isZero(delta2I) ? output2 : output1;

  output ??= outputMetadata
    ? new ValueView({
        valueView: {
          case: 'knownAssetId',
          value: {
            metadata: outputMetadata,
          },
        },
      })
    : new ValueView({
        valueView: {
          case: 'unknownAssetId',
          value: {
            amount: isZero(delta2I) ? delta1I : delta2I,
            assetId: isZero(delta2I) ? tradingPair?.asset2 : tradingPair?.asset1,
          },
        },
      });

  return {
    input,
    output,
    unfilled: getUnfilledAmount(swapView),
  };
};
