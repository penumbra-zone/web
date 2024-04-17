import { enableMapSet } from 'immer';
import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { CosmosKitSlice, createCosmosKitSlice } from './cosmos-kit';
import { createIbcOutSlice, IbcOutSlice } from './ibc-out';
import { createSendSlice, SendSlice } from './send';
import { createStakingSlice, StakingSlice } from './staking';
import { createSwapSlice, SwapSlice } from './swap';
import { createTransactionsSlice, TransactionsSlice } from './transactions';
import { createUnclaimedSwapsSlice, UnclaimedSwapsSlice } from './unclaimed-swaps';
import { createIbcInSlice, IbcInSlice } from './ibc-in';

/**
 * Required to enable use of `Map`s in Zustand state when using Immer
 * middleware. Without this, calling `.set()` on a `Map` in Zustand state
 * results in an error.
 */
enableMapSet();

export interface AllSlices {
  cosmosKit: CosmosKitSlice;
  ibcOut: IbcOutSlice;
  ibcIn: IbcInSlice;
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
    cosmosKit: createCosmosKitSlice()(setState, getState, store),
    ibcOut: createIbcOutSlice()(setState, getState, store),
    ibcIn: createIbcInSlice()(setState, getState, store),
    send: createSendSlice()(setState, getState, store),
    staking: createStakingSlice()(setState, getState, store),
    swap: createSwapSlice()(setState, getState, store),
    transactions: createTransactionsSlice()(setState, getState, store),
    unclaimedSwaps: createUnclaimedSwapsSlice()(setState, getState, store),
  }));
};

export const useStore = create<AllSlices>()(initializeStore());
