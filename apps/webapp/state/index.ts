import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createSendSlice, SendSlice } from './send';

export interface AllSlices {
  send: SendSlice;
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
  }));
};

export const useStore = create<AllSlices>()(initializeStore());
