import { create, StateCreator } from 'zustand';
import { AccountsSlice, createAccountsSlice } from './accounts';
import { immer } from 'zustand/middleware/immer';
import { customPersist } from './persist';
import { ExtensionStorage } from '../storage/base';
import { sessionExtStorage, SessionStorageState } from '../storage/session';
import { localExtStorage, LocalStorageState } from '../storage/local';
import { createPasswordSlice, PasswordSlice } from './password';
import { createOnboardingSlice, OnboardingSlice } from './onboarding';

export interface AllSlices {
  accounts: AccountsSlice;
  password: PasswordSlice;
  onboarding: OnboardingSlice;
}

export type SliceCreator<SliceInterface> = StateCreator<
  AllSlices,
  [['zustand/immer', never]],
  [],
  SliceInterface
>;

export const initializeStore = (
  session: ExtensionStorage<SessionStorageState>,
  local: ExtensionStorage<LocalStorageState>,
) => {
  return immer((setState, getState: () => AllSlices, store) => ({
    accounts: createAccountsSlice(local)(setState, getState, store),
    password: createPasswordSlice(session, local)(setState, getState, store),
    onboarding: createOnboardingSlice(setState, getState, store),
  }));
};

export const useStore = create<AllSlices>()(
  customPersist(initializeStore(sessionExtStorage, localExtStorage)),
);
