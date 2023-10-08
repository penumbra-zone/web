import { Asset, assets } from 'penumbra-constants';
import { AllSlices, SliceCreator } from '.';

export enum SwapToken {
  PAY = 'pay',
  RECEIVE = 'receive',
}

export interface SwapValidationFields {
  pay: boolean;
}

export interface SwapSlice {
  pay: {
    amount: string;
    asset: Asset;
  };
  receive: {
    amount: string;
    asset: Asset;
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
      asset: assets[0]!,
    },
    receive: {
      amount: '',
      asset: assets[1]!,
    },
    validationErrors: {
      pay: false,
    },
    setAmount: type => amount => {
      set(state => {
        state.swap[type].amount = amount;
      });

      // if (type === SwapToken.PAY) {
      //   const { asset } = get().swap.pay;
      //   set(state => {
      //     state.swap.validationErrors.pay = validateAmount(amount, asset.balance);
      //   });
      // }
    },
    setAsset: type => asset => {
      // const { amount } = get().swap.pay;
      let payAsset = get().swap.pay.asset;
      let receiveAsset = get().swap.receive.asset;

      // checking if we set the same asset in the pay (receive) field as
      // in the receive (pay) field, then the value of the receive (pay)
      // field is undefined
      if (type === SwapToken.PAY) {
        if (asset.name === receiveAsset.name) {
          receiveAsset = assets.find(i => i.name !== asset.name)!;
        }
        payAsset = asset;
      } else {
        if (asset.name === payAsset.name) {
          payAsset = assets.find(i => i.name !== asset.name)!;
        }
        receiveAsset = asset;
      }

      set(state => {
        state.swap.pay.asset = payAsset;
        state.swap.receive.asset = receiveAsset;
        // state.swap.validationErrors.pay = validateAmount(amount, payAsset.balance);
      });
    },
    replaceAsset: () => {
      const pay = get().swap.pay;
      const receive = get().swap.receive;

      set(state => {
        state.swap.pay = receive;
        state.swap.receive = pay;
        // state.swap.validationErrors.pay = validateAmount(receive.amount, receive.asset.balance);
      });
    },
  };
};

export const swapSelector = (state: AllSlices) => state.swap;
