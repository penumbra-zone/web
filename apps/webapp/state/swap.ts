import { assets } from '@penumbra-zone/constants';
import { AllSlices, SliceCreator } from '.';
import { Asset, AssetId } from '@penumbra-zone/types';

export enum SwapInputs {
  PAY = 'pay',
  RECEIVE = 'receive',
}

export interface SwapValidationFields {
  pay: boolean;
}

export interface SwapAssetInfo {
  amount: string;
  asset: Asset;
  balance?: number;
}

export interface SwapSlice {
  pay: SwapAssetInfo;
  receive: SwapAssetInfo;
  validationErrors: SwapValidationFields;
  setAmount: (type: SwapInputs) => (amount: string) => void;
  setAsset: (type: SwapInputs) => (asset: AssetId) => void;
  replaceAsset: () => void;
  setAssetBalance: (amount: number) => void;
}

export const createSwapSlice = (): SliceCreator<SwapSlice> => (set, get) => {
  return {
    pay: {
      amount: '',
      asset: assets[0]!,
      balance: 0,
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

      if (type === SwapInputs.PAY) {
        // TODO: Finish later
        // const { balance } = get().swap.pay;
        // set(state => {
        // state.swap.validationErrors.pay = validateAmount(amount, balance!);
        // });
      }
    },
    setAsset: type => asset => {
      let payAsset = get().swap.pay.asset;
      let receiveAsset = get().swap.receive.asset;

      const selectedAsset = assets.find(i => i.penumbraAssetId.inner === asset.inner)!;

      // checking if we set the same asset in the pay (receive) field as
      // in the receive (pay) field, then the value of the receive (pay)
      // field is undefined
      if (type === SwapInputs.PAY) {
        if (selectedAsset.display === receiveAsset.display) {
          receiveAsset = assets.find(i => i.display !== selectedAsset.display)!;
        }
        payAsset = selectedAsset;
      } else {
        if (selectedAsset.display === payAsset.display) {
          payAsset = assets.find(i => i.display !== selectedAsset.display)!;
        }
        receiveAsset = selectedAsset;
      }

      set(state => {
        state.swap.pay.asset = payAsset;
        state.swap.receive.asset = receiveAsset;
      });
    },
    setAssetBalance: () => {
      // TODO: Finish later
      // const { amount } = get().swap.pay;
      // set(state => {
      // state.swap.pay.balance = balance;
      // state.swap.validationErrors.pay = validateAmount(amount, balance);
      // });
    },
    replaceAsset: () => {
      const pay = get().swap.pay;
      const receive = get().swap.receive;

      set(state => {
        state.swap.pay = { ...receive, balance: 0 };
        state.swap.receive = { amount: pay.amount, asset: pay.asset };
      });
    },
  };
};

export const swapSelector = (state: AllSlices) => state.swap;
