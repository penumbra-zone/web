import { AllSlices, SliceCreator } from '.';
import { ChainInfo } from '../components/ibc/ibc-in/chain-dropdown';

export interface IbcInSlice {
  chain?: ChainInfo;
  setChain: (chain?: ChainInfo) => void;
}

export const createIbcInSlice = (): SliceCreator<IbcInSlice> => set => {
  return {
    chain: undefined,
    setChain: chain => {
      set(state => {
        state.ibcIn.chain = chain;
      });
    },
  };
};

export const ibcInSelector = (state: AllSlices) => state.ibcIn;
