import { create, StateCreator } from 'zustand';
import { enableMapSet } from 'immer';
import { immer } from 'zustand/middleware/immer';
import { createSwapSlice, SwapSlice } from './swap';
import { createIbcOutSlice, IbcOutSlice } from './ibc-out';
import { createSendSlice, SendSlice } from './send';
import { createStakingSlice, StakingSlice } from './staking';
import { createStatusSlice, StatusSlice } from './status';
import { createUnclaimedSwapsSlice, UnclaimedSwapsSlice } from './unclaimed-swaps';
import { createTransactionsSlice, TransactionsSlice } from './transactions';
import { createIbcInSlice, IbcInSlice } from './ibc-in';
import { createBalancesSlice, BalancesSlice } from './balances';
import { createSharedSlice, SharedSlice } from './shared';

/**
 * Required to enable use of `Map`s in Zustand state when using Immer
 * middleware. Without this, calling `.set()` on a `Map` in Zustand state
 * results in an error.
 */
enableMapSet();

/**
 * Slices are objects in state that have their own state and actions for a
 * specific set of concerns.
 */
export interface AllSlices {
  balances: BalancesSlice;
  ibcIn: IbcInSlice;
  ibcOut: IbcOutSlice;
  send: SendSlice;
  shared: SharedSlice;
  staking: StakingSlice;
  status: StatusSlice;
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
    balances: createBalancesSlice()(setState, getState, store),
    ibcIn: createIbcInSlice()(setState, getState, store),
    ibcOut: createIbcOutSlice()(setState, getState, store),
    send: createSendSlice()(setState, getState, store),
    shared: createSharedSlice()(setState, getState, store),
    staking: createStakingSlice()(setState, getState, store),
    status: createStatusSlice()(setState, getState, store),
    swap: createSwapSlice()(setState, getState, store),
    transactions: createTransactionsSlice()(setState, getState, store),
    unclaimedSwaps: createUnclaimedSwapsSlice()(setState, getState, store),
  }));
};

export const useStore = create<AllSlices>()(initializeStore());
