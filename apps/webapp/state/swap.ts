import { AllSlices, SliceCreator } from '.';
import { Asset } from '../types/asset';
import { validateAmount } from '../utils';

export enum SwapToken {
  PAY = 'pay',
  RECEIVE = 'receive',
}

export interface SwapValidationFields {
  pay: boolean;
  receive: boolean;
}

export interface SwapSlice {
  pay: {
    amount: string;
    asset: Asset | undefined;
  };
  receive: {
    amount: string;
    asset: Asset | undefined;
  };
  validationErrors: SwapValidationFields;
  setAmount: (type: SwapToken) => (amount: string) => void;
  setAsset: (type: SwapToken) => (asset: Asset) => void;
  replaceAsset: () => void;
}

export const createSwapSlice = (): SliceCreator<SwapSlice> => (set, get) => {
  return {
    pay: {
      amount: '',
      asset: undefined,
    },
    receive: {
      amount: '',
      asset: undefined,
    },
    validationErrors: {
      pay: false,
      receive: false,
    },
    setAmount: type => amount => {
      const { asset } = get().swap[type];

      set(state => {
        state.swap[type].amount = amount;
        state.swap.validationErrors[type] = !asset ? false : validateAmount(amount, asset.balance);
      });
    },
    setAsset: type => asset => {
      const { amount } = get().swap[type];

      set(state => {
        state.swap[type].asset = asset;
        state.swap.validationErrors[type] = validateAmount(amount, asset.balance);
      });
    },
    replaceAsset: () => {
      const pay = get().swap.pay;
      const receive = get().swap.receive;

      set(state => {
        state.swap.pay.asset = receive.asset;
        state.swap.receive.asset = pay.asset;
        state.swap.validationErrors.receive = validateAmount(
          receive.amount,
          pay.asset?.balance ?? 0,
        );
        state.swap.validationErrors.pay = validateAmount(pay.amount, receive.asset?.balance ?? 0);
      });
    },
  };
};

export const swapSelector = (state: AllSlices) => state.swap;
