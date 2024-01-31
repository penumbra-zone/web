import { localAssets } from '@penumbra-zone/constants';
import { AllSlices, SliceCreator } from './index.ts';
import { DenomMetadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1alpha1/asset_pb';

export enum SwapInputs {
  PAY = 'pay',
  RECEIVE = 'receive',
}

export interface SwapValidationFields {
  pay: boolean;
}

export interface SwapAssetInfo {
  amount: string;
  asset: DenomMetadata;
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
      asset: localAssets[0]!,
      balance: 0,
    },
    receive: {
      amount: '',
      asset: localAssets[1]!,
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

      const selectedAsset = localAssets.find(i => asset.equals(i.penumbraAssetId))!;

      // checking if we set the same asset in the pay (receive) field as
      // in the receive (pay) field, then the value of the receive (pay)
      // field is undefined
      if (type === SwapInputs.PAY) {
        if (selectedAsset.display === receiveAsset.display) {
          receiveAsset = localAssets.find(i => i.display !== selectedAsset.display)!;
        }
        payAsset = selectedAsset;
      } else {
        if (selectedAsset.display === payAsset.display) {
          payAsset = localAssets.find(i => i.display !== selectedAsset.display)!;
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
