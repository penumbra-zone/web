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
      let payAsset = get().swap.pay.asset;
      let receiveAsset = get().swap.receive.asset;

      // checking if we set the same asset in the pay (receive) field as
      // in the receive (pay) field, then the value of the receive (pay)
      // field is undefined
      if (type === SwapToken.PAY) {
        if (asset.name === receiveAsset?.name) {
          receiveAsset = undefined;
        }
        payAsset = asset;
      } else {
        if (asset.name === payAsset?.name) {
          payAsset = undefined;
        }

        receiveAsset = asset;
      }

      set(state => {
        state.swap.pay.asset = payAsset;
        state.swap.receive.asset = receiveAsset;
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
