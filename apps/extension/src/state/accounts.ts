import { AllSlices, SliceCreator } from './index';
import {
  getAddressByIndex,
  getEphemeralByIndex,
  getShortAddressByIndex,
} from '@penumbra-zone/wasm-ts';
import { getActiveWallet } from './wallets';
import { Account, bech32Address } from '@penumbra-zone/types';

export interface AccountsSlice {
  index: number;
  ephemeral: boolean;
  previous: () => void;
  next: () => void;
  setIndex: (index: number) => void;
  setEphemeral: (ephemeral: boolean) => void;
}

export const createAccountsSlice: SliceCreator<AccountsSlice> = (set, get) => {
  return {
    index: 0, // Start with index 0
    ephemeral: false,
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
    setIndex: index => {
      set(state => {
        state.accounts.index = index;
      });
    },
    setEphemeral: ephemeral => {
      set(state => {
        state.accounts.ephemeral = ephemeral;
      });
    },
  };
};

export const accountsSelector = (state: AllSlices) => state.accounts;

export const selectedAccount = (state: AllSlices): Account | undefined => {
  const active = getActiveWallet(state);
  if (!active) return undefined;

  const ephemeral = state.accounts.ephemeral;
  const index = state.accounts.index;

  const addr = ephemeral
    ? getEphemeralByIndex(active.fullViewingKey, index)
    : getAddressByIndex(active.fullViewingKey, index);
  const bech32Addr = bech32Address(addr);

  return {
    address: bech32Addr,
    preview: ephemeral
      ? bech32Addr.slice(0, 33) + '…'
      : getShortAddressByIndex(active.fullViewingKey, index),
    index,
  };
};
