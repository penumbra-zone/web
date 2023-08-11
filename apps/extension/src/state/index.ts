import { create, StateCreator } from 'zustand';
import { BearSlice, createBearSlice, createFishSlice, FishSlice } from './accounts';
import { customPersist } from './middleware';

export type AllSlices = BearSlice & FishSlice;

export type SliceCreator<SliceInterface> = StateCreator<AllSlices, [], [], SliceInterface>;

export const useStore = create<AllSlices>()(
  customPersist((setState, getState, store) => ({
    ...createBearSlice(setState, getState, store),
    ...createFishSlice(setState, getState, store),
  })),
);
