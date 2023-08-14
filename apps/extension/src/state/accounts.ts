import { AllSlices, SliceCreator } from './index';
import { Account } from '../types/accounts';
import { ExtensionStorage } from '../storage/generic';
import { LocalStorageState } from '../storage/local';

export interface AccountsSlice {
  all: Account[];
  addAccount: (account: Account) => void;
}

export const createAccountsSlice =
  (local: ExtensionStorage<LocalStorageState>): SliceCreator<AccountsSlice> =>
  (set) => {
    return {
      all: [],
      addAccount: (newAccount) => {
        set((state) => {
          state.accounts.all.unshift(newAccount);
        });
        void local.get('accounts').then((accounts) => {
          void local.set('accounts', [newAccount, ...accounts]);
        });
      },
    };
  };

export const allAccountsSelector = (state: AllSlices) => state.accounts.all;
