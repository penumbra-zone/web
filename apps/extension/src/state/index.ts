import { create, StateCreator } from 'zustand';
import { AccountsSlice, createAccountsSlice } from './accounts';
import { immer } from 'zustand/middleware/immer';
import { customPersist } from './persist';
import { ExtensionStorage } from '../storage/base';
import { sessionExtStorage, SessionStorageState } from '../storage/session';
import { localExtStorage, LocalStorageState } from '../storage/local';
import { createPasswordSlice, PasswordSlice } from './password';
import { createSeedPhraseSlice, SeedPhraseSlice } from './seed-phrase';
import { logger } from './logger';

export interface AllSlices {
  accounts: AccountsSlice;
  seedPhrase: SeedPhraseSlice;
  password: PasswordSlice;
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
    seedPhrase: createSeedPhraseSlice(setState, getState, store),
  }));
};

// Wrap in logger() middleware if wanting to see store changes in console
export const useStore = create<AllSlices>()(
  logger(customPersist(initializeStore(sessionExtStorage, localExtStorage))),
);
