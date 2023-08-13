import { create, StateCreator } from 'zustand';
import { AccountsSlice, createAccountsSlice } from './accounts';
import { immer } from 'zustand/middleware/immer';
import { createNetworkSlice, NetworkSlice } from './network';
import { customPersist } from './persist';
import { ExtensionStorage } from '../storage/generic';
import { sessionExtStorage, SessionStorageState } from '../storage/session';
import { localExtStorage, LocalStorageState } from '../storage/local';

export interface AllSlices {
  accounts: AccountsSlice;
  network: NetworkSlice;
}

export type SliceCreator<SliceInterface> = StateCreator<
  AllSlices,
  [['zustand/immer', never]],
  [],
  SliceInterface
>;

export type SliceCreatorWithStorage<SliceInterface> = (
  session: ExtensionStorage<SessionStorageState>,
  local: ExtensionStorage<LocalStorageState>,
) => SliceCreator<SliceInterface>;

export const initializeStore = (
  session: ExtensionStorage<SessionStorageState>,
  local: ExtensionStorage<LocalStorageState>,
) => {
  return immer((setState, getState: () => AllSlices, store) => ({
    accounts: createAccountsSlice(session, local)(setState, getState, store),
    network: createNetworkSlice(setState, getState, store),
  }));
};

export const useStore = create<AllSlices>()(
  customPersist(initializeStore(sessionExtStorage, localExtStorage)),
);
