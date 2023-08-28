import { AllSlices, SliceCreator } from './index';
import { Account } from '../types/accounts';
import { ExtensionStorage } from '../storage/base';
import { LocalStorageState } from '../storage/local';

export interface AccountsSlice {
  all: Account[];
  // The isInitialized variable keeps track of whether the first account has been initialized. 
  isInitialized: boolean;
  addAccount: (account: Account) => void;
}

export const createAccountsSlice =
  (local: ExtensionStorage<LocalStorageState>): SliceCreator<AccountsSlice> =>
  set => {
    return {
      all: [],
      isInitialized: false,
      addAccount: newAccount => {
        set(state => {
          state.accounts.all.unshift(newAccount);
          state.accounts.isInitialized = true;
        });
        void local.get('accounts').then(accounts => {
          void local.set('accounts', [newAccount, ...accounts]);
        });
        void local.set('isInitialized', true);
      },
    };
  };

export const accountsSelector = (state: AllSlices) => state.accounts;
