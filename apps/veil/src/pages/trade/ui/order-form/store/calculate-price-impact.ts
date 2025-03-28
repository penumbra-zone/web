import { SwapExecution } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { getAmountFromValue, getAssetIdFromValue } from '@penumbra-zone/getters/value';
import { divideAmounts } from '@penumbra-zone/types/amount';
import { AssetId, Value } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';

const getMatchingAmount = (values: Value[], toMatch: AssetId): Amount => {
  const match = values.find(v => toMatch.equals(v.assetId));
  if (!match?.amount) {
    throw new Error('No match in values array found');
  }

  return match.amount;
};

/**
  Price impact is the change in price as a consequence of the trade's size. In SwapExecution, the
  first trace in the array is the best execution for the swap. To calculate price impact, take
  the price of the trade and see the % diff off the best execution trace.
 */
export const calculatePriceImpact = (swapExec?: SwapExecution): number | undefined => {
  if (!swapExec?.traces.length || !swapExec.output || !swapExec.input) {
    return undefined;
  }

  // Get the price of the estimate for the swap total
  const inputAmount = getAmountFromValue(swapExec.input);
  const outputAmount = getAmountFromValue(swapExec.output);
  const swapEstimatePrice = divideAmounts(outputAmount, inputAmount);

  // Get the price in the best execution trace
  const inputAssetId = getAssetIdFromValue(swapExec.input);
  const outputAssetId = getAssetIdFromValue(swapExec.output);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- the check is done above
  const bestTrace = swapExec.traces[0]!;
  const bestInputAmount = getMatchingAmount(bestTrace.value, inputAssetId);
  const bestOutputAmount = getMatchingAmount(bestTrace.value, outputAssetId);
  const bestTraceEstimatedPrice = divideAmounts(bestOutputAmount, bestInputAmount);

  // Difference = (priceB - priceA) / priceA
  const percentDifference = swapEstimatePrice
    .minus(bestTraceEstimatedPrice)
    .div(bestTraceEstimatedPrice);

  return percentDifference.toNumber();
};
