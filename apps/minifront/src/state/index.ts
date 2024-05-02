import { create, StateCreator } from 'zustand';
import { enableMapSet } from 'immer';
import { immer } from 'zustand/middleware/immer';
import { createDutchAuctionSlice, DutchAuctionSlice } from './dutch-auction';
import { createSwapSlice, SwapSlice } from './swap';
import { createIbcOutSlice, IbcOutSlice } from './ibc-out';
import { createSendSlice, SendSlice } from './send';
import { createStakingSlice, StakingSlice } from './staking';
import { createUnclaimedSwapsSlice, UnclaimedSwapsSlice } from './unclaimed-swaps';
import { createTransactionsSlice, TransactionsSlice } from './transactions';
import { createIbcInSlice, IbcInSlice } from './ibc-in';

/**
 * Required to enable use of `Map`s in Zustand state when using Immer
 * middleware. Without this, calling `.set()` on a `Map` in Zustand state
 * results in an error.
 */
enableMapSet();

export interface AllSlices {
  ibcIn: IbcInSlice;
  ibcOut: IbcOutSlice;
  dutchAuction: DutchAuctionSlice;
  send: SendSlice;
  staking: StakingSlice;
  swap: SwapSlice;
  transactions: TransactionsSlice;
  unclaimedSwaps: UnclaimedSwapsSlice;
}

export type SliceCreator<SliceInterface> = StateCreator<
  AllSlices,
  [['zustand/immer', never]],
  [],
  SliceInterface
>;

export const initializeStore = () => {
  return immer((setState, getState: () => AllSlices, store) => ({
    ibcIn: createIbcInSlice()(setState, getState, store),
    ibcOut: createIbcOutSlice()(setState, getState, store),
    dutchAuction: createDutchAuctionSlice()(setState, getState, store),
    send: createSendSlice()(setState, getState, store),
    staking: createStakingSlice()(setState, getState, store),
    swap: createSwapSlice()(setState, getState, store),
    transactions: createTransactionsSlice()(setState, getState, store),
    unclaimedSwaps: createUnclaimedSwapsSlice()(setState, getState, store),
  }));
};

export const useStore = create<AllSlices>()(initializeStore());
