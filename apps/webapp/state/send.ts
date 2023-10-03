import { AllSlices, SliceCreator } from './index';

export interface SendSlice {
  key: undefined;
  setPassword: () => void;
}

export const createSendSlice = (): SliceCreator<SendSlice> => () => {
  return {
    key: undefined,
    setPassword: () => console.log('there'),
  };
};

export const sendSelector = (state: AllSlices) => state.send;
