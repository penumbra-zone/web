import { DutchAuctionDescription } from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { getStepIndex } from './get-step-index';
import { joinLoHiAmount } from '@penumbra-zone/types/amount';
import { splitLoHi } from '@penumbra-zone/types/lo-hi';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';

/**
 * Returns the price, _in the output asset_, for one _display_ denom of the
 * input asset.
 *
 * For example, if you're selling 100 UM in a Dutch auction with a max output of
 * 1000 USDC and min output of 10 USDC, the value of 1 UM ranges from 10 USDC
 * (at the start of the auction) to 0.1 USDC (at the end). This function will
 * return an `Amount` that represents whatever value the input is, _per display
 * token_, in terms of the output asset, at the given block height.
 *
 * Adapted from
 * https://github.com/penumbra-zone/penumbra/blob/e0291fb/crates/core/component/auction/src/component/dutch_auction.rs#L548-L572
 */
export const getPrice = (
  auctionDescription: DutchAuctionDescription,
  inputMetadata?: Metadata,
  fullSyncHeight?: bigint,
): Amount | undefined => {
  const stepIndex = getStepIndex(auctionDescription, fullSyncHeight);
  if (
    stepIndex === undefined ||
    !auctionDescription.maxOutput ||
    !auctionDescription.minOutput ||
    !auctionDescription.input?.amount
  ) {
    return undefined;
  }

  const maxOutput = joinLoHiAmount(auctionDescription.maxOutput);
  const minOutput = joinLoHiAmount(auctionDescription.minOutput);
  const input = joinLoHiAmount(auctionDescription.input.amount);
  const stepCount = auctionDescription.stepCount;

  // The target output, scaled up by `step_count` to avoid divisions.
  // Linearly interpolate between `max_output` at `step_index = 0`
  //                          and `min_output` at `step_index = step_count - 1`.
  const targetOutputScaled = (stepCount - stepIndex - 1n) * maxOutput + stepIndex * minOutput;
  // The input, scaled up by `step_count` to match.
  const inputScaled = (stepCount - 1n) * input;

  const inputDisplayDenomExponent = getDisplayDenomExponent.optional(inputMetadata);
  const multiplier = 10 ** (inputDisplayDenomExponent ?? 0);
  const price = Math.round((Number(targetOutputScaled) / Number(inputScaled)) * multiplier);

  return new Amount(splitLoHi(BigInt(price)));
};
