import { AllSlices, SliceCreator } from './index';
import { getAddressByIndex, getShortAddressByIndex } from '@penumbra-zone/wasm-ts';
import { getActiveWallet } from './wallets';
import { bech32Address } from '@penumbra-zone/types';

interface Account {
  address: string;
  preview: string;
  index: number;
}

export interface AccountsSlice {
  index: number;
  previous: () => void;
  next: () => void;
}

export const createAccountsSlice: SliceCreator<AccountsSlice> = (set, get) => {
  return {
    index: 0, // Start with index 0
    previous: () => {
      const current = get().accounts.index;
      set(state => {
        if (current > 0) {
          state.accounts.index = current - 1;
        }
      });
    },
    next: () => {
      const current = get().accounts.index;
      set(state => {
        state.accounts.index = current + 1;
      });
    },
  };
};

export const accountsSelector = (state: AllSlices) => state.accounts;

export const selectedAccount = (state: AllSlices): Account | undefined => {
  const active = getActiveWallet(state);
  if (!active) return undefined;

  const addr = getAddressByIndex(active.fullViewingKey, state.accounts.index);
  const bech32Addr = bech32Address(addr);

  return {
    address: bech32Addr,
    preview: getShortAddressByIndex(active.fullViewingKey, state.accounts.index),
    index: state.accounts.index,
  };
};
