import { AllSlices, SliceCreator } from '.';
import { ChainInfo } from '../components/ibc/ibc-in/chain-dropdown';

export interface IbcInSlice {
  selectedChain?: ChainInfo;
  setSelectedChain: (chain?: ChainInfo) => void;
}

export const createIbcInSlice = (): SliceCreator<IbcInSlice> => set => {
  return {
    selectedChain: undefined,
    setSelectedChain: chain => {
      set(state => {
        state.ibcIn.selectedChain = chain;
      });
    },
  };
};

export const ibcInSelector = (state: AllSlices) => state.ibcIn;
