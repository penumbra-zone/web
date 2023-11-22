import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface AccountsSlice {
  index: number;
  ephemeral: boolean;
  previous: () => void;
  next: () => void;
  setIndex: (index: number) => void;
  setEphemeral: (ephemeral: boolean) => void;
}

export const useAccountStore = create<AccountsSlice>()(
  immer((set, get) => ({
    index: 0, // Start with index 0
    ephemeral: false,
    previous: () => {
      const current = get().index;
      if (current > 0) {
        set(state => {
          state.index = current - 1;
        });
      }
    },
    next: () => {
      const current = get().index;
      set(state => {
        state.index = current + 1;
      });
    },
    setIndex: index => {
      set(state => {
        state.index = index;
      });
    },
    setEphemeral: ephemeral => {
      set(state => {
        state.ephemeral = ephemeral;
      });
    },
  })),
);
