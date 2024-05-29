import { TransactionPlannerRequest_ActionDutchAuctionSchedule } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { getAssetId, getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';
import {
  getAssetIdFromValueView,
  getDisplayDenomExponentFromValueView,
} from '@penumbra-zone/getters/value-view';
import { divideAmounts, fromString } from '@penumbra-zone/types/amount';
import { DutchAuctionSlice } from '.';
import { viewClient } from '../../../clients';
import { GDA_RECIPES, GdaRecipe, STEP_COUNT } from '../constants';
import { BLOCKS_PER_MINUTE } from '../../constants';
import { timeUntilNextEvent } from './time-until-next-event';
import { splitLoHi } from '@penumbra-zone/types/lo-hi';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { BigNumber } from 'bignumber.js';
import { SwapSlice } from '..';

/**
 * The start height of an auction must be, at minimum, the current block height.
 * Since the transaction may take a while to build, and the user may take a
 * while to approve it, we need to add some buffer time to the start height.
 * Roughly a minute seems appropriate.
 */
const getStartHeight = (fullSyncHeight: bigint) => fullSyncHeight + BLOCKS_PER_MINUTE;

/**
 * Sub-auctions are spaced apart using a Poisson distribution to ensure random
 * yet statistically predictable spacing. This means that sub-auctions will have
 * some overlap, and prevents too many users' auctions from starting/ending on
 * identical block heights.
 */
const getSubAuctionStartHeights = (overallStartHeight: bigint, recipe: GdaRecipe): bigint[] => {
  const startHeights: bigint[] = [];
  const lambda = recipe.poissonIntensityPerBlock;
  let currentHeight = overallStartHeight;

  for (let i = 0n; i < recipe.numberOfSubAuctions; i++) {
    const fastForwardClock = timeUntilNextEvent(lambda);
    currentHeight += BigInt(Math.ceil(fastForwardClock));
    startHeights.push(currentHeight);
  }

  return startHeights;
};

export const getSubAuctions = async ({
  amount: amountAsString,
  assetIn,
  assetOut,
  minOutput,
  maxOutput,
  duration,
}: Pick<SwapSlice, 'amount' | 'assetIn' | 'assetOut' | 'duration'> &
  Pick<DutchAuctionSlice, 'minOutput' | 'maxOutput'>): Promise<
    TransactionPlannerRequest_ActionDutchAuctionSchedule[]
  > => {
  if (duration === 'instant') return [];
  const inputAssetId = getAssetIdFromValueView(assetIn?.balanceView);
  const outputAssetId = getAssetId(assetOut);
  const assetInExponent = getDisplayDenomExponentFromValueView(assetIn?.balanceView);
  const assetOutExponent = getDisplayDenomExponent(assetOut);
  const inputAmount = fromString(amountAsString, assetInExponent);
  const minOutputAmount = fromString(minOutput, assetOutExponent);
  const maxOutputAmount = fromString(maxOutput, assetOutExponent);

  const recipe = GDA_RECIPES[duration];

  const scaledInputAmount = splitLoHi(
    BigInt(
      divideAmounts(inputAmount, new Amount(splitLoHi(recipe.numberOfSubAuctions)))
        .decimalPlaces(0, BigNumber.ROUND_FLOOR)
        .toString(),
    ),
  );

  const scaledMinOutputAmount = splitLoHi(
    BigInt(
      divideAmounts(minOutputAmount, new Amount(splitLoHi(recipe.numberOfSubAuctions)))
        .decimalPlaces(0, BigNumber.ROUND_FLOOR)
        .toString(),
    ),
  );

  const scaledMaxOutputAmount = splitLoHi(
    BigInt(
      divideAmounts(maxOutputAmount, new Amount(splitLoHi(recipe.numberOfSubAuctions)))
        .decimalPlaces(0, BigNumber.ROUND_FLOOR)
        .toString(),
    ),
  );

  const { fullSyncHeight } = await viewClient.status({});

  const overallStartHeight = getStartHeight(fullSyncHeight);

  return getSubAuctionStartHeights(overallStartHeight, recipe).map(
    startHeight => {
      return new TransactionPlannerRequest_ActionDutchAuctionSchedule({
        description: {
          startHeight,
          endHeight: startHeight + recipe.subAuctionDurationInBlocks,
          input: { amount: scaledInputAmount, assetId: inputAssetId },
          outputId: outputAssetId,
          stepCount: STEP_COUNT,
          minOutput: scaledMinOutputAmount,
          maxOutput: scaledMaxOutputAmount,
        },
      });
    }
  );
  };
