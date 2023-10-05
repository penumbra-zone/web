import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createSendSlice, SendSlice } from './send';
import { createIbcSlice, IbcSlice } from './ibc';
import { createSwapSlice, SwapSlice } from './swap';

export interface AllSlices {
  send: SendSlice;
  ibc: IbcSlice;
  swap: SwapSlice;
}

export type SliceCreator<SliceInterface> = StateCreator<
  AllSlices,
  [['zustand/immer', never]],
  [],
  SliceInterface
>;

export const initializeStore = () => {
  return immer((setState, getState: () => AllSlices, store) => ({
    send: createSendSlice()(setState, getState, store),
    ibc: createIbcSlice()(setState, getState, store),
    swap: createSwapSlice()(setState, getState, store),
  }));
};

export const useStore = create<AllSlices>()(initializeStore());
