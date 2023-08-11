import { SliceCreator } from './index';

export interface AccountsSlice {
  password: string | undefined;
  setPassword: (newPassword: string) => void;
}

export const createAccountsSlice: SliceCreator<AccountsSlice> = (set) => ({
  password: undefined,
  setPassword: (newPassword) => {
    // should have encryption here
    set(() => ({ password: newPassword }));
  },
});
