import { AllSlices, SliceCreator } from '.';

export interface AccountSlice {
  isConnected: boolean;
  setConnected: (connected: boolean) => void;
}

export const createAccountSlice = (): SliceCreator<AccountSlice> => set => {
  return {
    isConnected: false,
    setConnected: connected => {
      set(state => {
        state.account.isConnected = connected;
      });
    },
  };
};

export const accountSelector = (state: AllSlices) => state.account;
