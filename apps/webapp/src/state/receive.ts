import { Account } from '@penumbra-zone/types';
import { AllSlices, SliceCreator } from '.';
import { getAddressByIndex, getEphemeralAddress } from '../fetchers/address';

export interface ReceiveSlice {
  index: number;
  ephemeral: boolean;
  selectedAccount: Account | undefined;
  previous: () => void;
  next: () => void;
  setIndex: (index: number) => void;
  setEphemeral: (ephemeral: boolean) => void;
  setSelectedAccount: () => Promise<void>;
}

export const createReceiveSlice = (): SliceCreator<ReceiveSlice> => (set, get) => {
  return {
    index: 0,
    ephemeral: false,
    selectedAccount: undefined,
    previous: () => {
      const current = get().receive.index;
      if (current > 0) {
        set(state => {
          state.receive.index = current - 1;
        });
      }
    },
    next: () => {
      const current = get().receive.index;
      set(state => {
        state.receive.index = current + 1;
      });
    },
    setIndex: index => {
      set(state => {
        state.receive.index = index;
      });
    },
    setEphemeral: ephemeral => {
      set(state => {
        state.receive.ephemeral = ephemeral;
      });
    },
    setSelectedAccount: async () => {
      const { ephemeral, index } = get().receive;
      const address = ephemeral ? await getEphemeralAddress(index) : await getAddressByIndex(index);

      set(state => {
        state.receive.selectedAccount = {
          address,
          preview: address.slice(0, 33) + '…',
          index,
        };
      });
    },
  };
};

export const receiveSelector = (state: AllSlices) => state.receive;
