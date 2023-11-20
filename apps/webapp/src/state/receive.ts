import { AllSlices, SliceCreator } from '.';

export interface ReceiveSlice {
  index: number;
  ephemeral: boolean;
  previous: () => void;
  next: () => void;
  setIndex: (index: number) => void;
  setEphemeral: (ephemeral: boolean) => void;
}

export const createReceiveSlice = (): SliceCreator<ReceiveSlice> => (set, get) => {
  return {
    index: 0,
    ephemeral: false,
    previous: () => {
      const current = get().receive.index;
      set(state => {
        if (current > 0) {
          state.receive.index = current - 1;
        }
      });
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
  };
};

export const receiveSelector = (state: AllSlices) => state.receive;
