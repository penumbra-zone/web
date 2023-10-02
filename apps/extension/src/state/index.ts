import { create, StateCreator } from 'zustand';
import { createWalletsSlice, WalletsSlice } from './wallets';
import { immer } from 'zustand/middleware/immer';
import { customPersist } from './persist';
import { ExtensionStorage } from '../storage/base';
import { sessionExtStorage, SessionStorageState } from '../storage/session';
import { localExtStorage, LocalStorageState } from '../storage/local';
import { createPasswordSlice, PasswordSlice } from './password';
import { createSeedPhraseSlice, SeedPhraseSlice } from './seed-phrase';
import { createNetworkSlice, NetworkSlice } from './network';
import { AccountsSlice, createAccountsSlice } from './accounts';

export interface AllSlices {
  wallets: WalletsSlice;
  accounts: AccountsSlice;
  password: PasswordSlice;
  seedPhrase: SeedPhraseSlice;
  network: NetworkSlice;
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
    wallets: createWalletsSlice(local)(setState, getState, store),
    accounts: createAccountsSlice(setState, getState, store),
    password: createPasswordSlice(session, local)(setState, getState, store),
    seedPhrase: createSeedPhraseSlice(setState, getState, store),
    network: createNetworkSlice(setState, getState, store),
  }));
};

// Wrap in logger() middleware if wanting to see store changes in console
export const useStore = create<AllSlices>()(
  customPersist(initializeStore(sessionExtStorage, localExtStorage)),
);
