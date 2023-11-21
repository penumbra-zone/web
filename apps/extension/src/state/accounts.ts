import { AllSlices, SliceCreator } from './index';
import {
  getAddressByIndex,
  getEphemeralByIndex,
  getShortAddressByIndex,
} from '@penumbra-zone/wasm-ts';
import { Account, bech32Address } from '@penumbra-zone/types';

export interface AccountsSlice {
  index: number;
  ephemeral: boolean;
  selectedAccount: Account | undefined;
  previous: () => void;
  next: () => void;
  setIndex: (index: number) => void;
  setEphemeral: (ephemeral: boolean) => void;
  setSelectedAccount: () => void;
}

export const createAccountsSlice: SliceCreator<AccountsSlice> = (set, get) => {
  return {
    index: 0, // Start with index 0
    ephemeral: false,
    selectedAccount: undefined,
    previous: () => {
      const current = get().accounts.index;
      if (current > 0) {
        set(state => {
          state.accounts.index = current - 1;
        });
      }
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
    setSelectedAccount: () => {
      const active = get().wallets.all[0];
      if (!active) return undefined;
      const { ephemeral, index } = get().accounts;

      const addr = ephemeral
        ? getEphemeralByIndex(active.fullViewingKey, index)
        : getAddressByIndex(active.fullViewingKey, index);
      const bech32Addr = bech32Address(addr);

      set(state => {
        state.accounts.selectedAccount = {
          address: bech32Addr,
          preview: ephemeral
            ? bech32Addr.slice(0, 33) + '…'
            : getShortAddressByIndex(active.fullViewingKey, index),
          index,
        };
      });
    },
  };
};

export const accountsSelector = (state: AllSlices) => state.accounts;
