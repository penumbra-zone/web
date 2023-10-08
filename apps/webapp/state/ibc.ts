import { Asset, assets } from 'penumbra-constants';
import { AllSlices, SliceCreator } from '.';
import { Chain } from '../app/send/types';
// import { validateAmount } from '../utils';

export interface IbcValidationFields {
  amount: boolean;
}

export interface IbcSendSlice {
  amount: string;
  asset: Asset;
  chain: Chain | undefined;
  validationErrors: IbcValidationFields;
  setAmount: (amount: string) => void;
  setAsset: (asset: Asset) => void;
  setChain: (chain: Chain | undefined) => void;
}

export const createIbcSendSlice = (): SliceCreator<IbcSendSlice> => (set) => {
  return {
    amount: '',
    asset: assets[0]!,
    chain: undefined,
    validationErrors: {
      amount: false,
    },
    setAmount: amount => {
      // const { asset } = get().ibc;

      set(state => {
        state.ibc.amount = amount;
        // state.ibc.validationErrors.amount = !asset ? false : validateAmount(amount, asset.balance);
      });
    },
    setAsset: asset => {
      // const { amount } = get().ibc;

      set(state => {
        state.ibc.asset = asset;
        // state.ibc.validationErrors.amount = validateAmount(amount, asset.balance);
      });
    },

    setChain: chain => {
      set(state => {
        state.ibc.chain = chain;
      });
    },
  };
};

export const ibcSelector = (state: AllSlices) => state.ibc;
