import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { BLOCKS_PER_MINUTE, DURATION_IN_BLOCKS, STEP_COUNT } from './constants';
import { getAssetIdFromValueView } from '@penumbra-zone/getters/value-view';
import { getAssetId } from '@penumbra-zone/getters/metadata';
import { DutchAuctionSlice } from '.';
import { viewClient } from '../../clients';
import { fromString } from '@penumbra-zone/types/amount';

/**
 * The start height of an auction must be, at minimum, the current block height.
 * Since the transaction may take a while to build, and the user may take a
 * while to approve it, we need to add some buffer time to the start height.
 * Roughly a minute seems appropriate.
 */
const getStartHeight = (fullSyncHeight: bigint) => fullSyncHeight + BLOCKS_PER_MINUTE;

export const assembleRequest = async ({
  amount: amountAsString,
  assetIn,
  assetOut,
  minOutput,
  maxOutput,
  duration,
}: Pick<
  DutchAuctionSlice,
  'amount' | 'assetIn' | 'assetOut' | 'minOutput' | 'maxOutput' | 'duration'
>): Promise<TransactionPlannerRequest> => {
  const assetId = getAssetIdFromValueView(assetIn?.balanceView);
  const outputId = getAssetId(assetOut);
  const amount = fromString(amountAsString);

  const { fullSyncHeight } = await viewClient.status({});

  const startHeight = getStartHeight(fullSyncHeight);
  const endHeight = startHeight + DURATION_IN_BLOCKS.get(duration)!;

  return new TransactionPlannerRequest({
    dutchAuctionScheduleActions: [
      {
        description: {
          input: {
            amount,
            assetId,
          },
          outputId,
          startHeight,
          endHeight,
          stepCount: STEP_COUNT,
          minOutput: fromString(minOutput),
          maxOutput: fromString(maxOutput),
        },
      },
    ],
  });
};
