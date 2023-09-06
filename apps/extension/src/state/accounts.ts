import { AllSlices, SliceCreator } from './index';
import { Account } from '../types/accounts';
import { ExtensionStorage } from '../storage/base';
import { LocalStorageState } from '../storage/local';

export interface AccountsSlice {
  all: Account[];
  addAccount: (account: Account) => Promise<void>;
}

export const createAccountsSlice =
  (local: ExtensionStorage<LocalStorageState>): SliceCreator<AccountsSlice> =>
  set => {
    return {
      all: [],
      addAccount: async newAccount => {
        set(state => {
          state.accounts.all.unshift(newAccount);
        });

        const accounts = await local.get('accounts');
        await local.set('accounts', [newAccount, ...accounts]);
      },
    };
  };

export const accountsSelector = (state: AllSlices) => state.accounts;
