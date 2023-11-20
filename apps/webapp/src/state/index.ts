import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createIbcSendSlice, IbcSendSlice } from './ibc.ts';
import { createSendSlice, SendSlice } from './send.ts';
import { createSwapSlice, SwapSlice } from './swap.ts';
import { createReceiveSlice, ReceiveSlice } from './receive.ts';

export interface AllSlices {
  send: SendSlice;
  ibc: IbcSendSlice;
  swap: SwapSlice;
  receive: ReceiveSlice;
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
    ibc: createIbcSendSlice()(setState, getState, store),
    swap: createSwapSlice()(setState, getState, store),
    receive: createReceiveSlice()(setState, getState, store),
  }));
};

export const useStore = create<AllSlices>()(initializeStore());
