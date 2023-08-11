import { create, StateCreator } from 'zustand';
import { AccountsSlice, createAccountsSlice } from './accounts';
import { customPersist } from './middleware';

export type AllSlices = AccountsSlice;

export type SliceCreator<SliceInterface> = StateCreator<AllSlices, [], [], SliceInterface>;

export const useStore = create<AllSlices>()(
  customPersist((setState, getState, store) => ({
    ...createAccountsSlice(setState, getState, store),
  })),
);
