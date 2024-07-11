import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';
import { DutchAuctionSlice } from '.';
import { getSubAuctions } from './get-sub-auctions';
import { getAddressIndex } from '@penumbra-zone/getters/balances-response';
import { SwapSlice } from '..';

export const assembleScheduleRequest = async ({
  amount,
  assetIn,
  assetOut,
  minOutput,
  maxOutput,
  duration,
}: Pick<SwapSlice, 'amount' | 'assetIn' | 'assetOut' | 'duration'> &
  Pick<DutchAuctionSlice, 'minOutput' | 'maxOutput'>): Promise<TransactionPlannerRequest> => {
  const source = getAddressIndex.optional()(assetIn);

  return new TransactionPlannerRequest({
    dutchAuctionScheduleActions: await getSubAuctions({
      amount,
      assetIn,
      assetOut,
      minOutput,
      maxOutput,
      duration,
    }),
    source,
  });
};
