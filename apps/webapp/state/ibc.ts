import { Asset, AssetId, assets } from 'penumbra-constants';
import { AllSlices, SliceCreator } from '.';
import { Chain } from '../app/send/types';
import { validateAmount } from '../utils';

export interface IbcValidationFields {
  amount: boolean;
}

export interface IbcSendSlice {
  amount: string;
  asset: Asset;
  chain: Chain | undefined;
  assetBalance: number;
  validationErrors: IbcValidationFields;
  setAmount: (amount: string) => void;
  setAsset: (asset: AssetId) => void;
  setChain: (chain: Chain | undefined) => void;
  setAssetBalance: (amount: number) => void;
}

export const createIbcSendSlice = (): SliceCreator<IbcSendSlice> => (set, get) => {
  return {
    amount: '',
    asset: assets[0]!,
    chain: undefined,
    assetBalance: 0,
    validationErrors: {
      amount: false,
    },
    setAmount: amount => {
      const { assetBalance } = get().ibc;

      set(state => {
        state.ibc.amount = amount;
        state.ibc.validationErrors.amount = validateAmount(amount, assetBalance);
      });
    },
    setAsset: asset => {
      const selectedAsset = assets.find(i => i.penumbraAssetId.inner === asset.inner)!;
      set(state => {
        state.ibc.asset = selectedAsset;
      });
    },

    setChain: chain => {
      set(state => {
        state.ibc.chain = chain;
      });
    },
    setAssetBalance: balance => {
      const { amount } = get().ibc;
      set(state => {
        state.ibc.assetBalance = balance;
        state.ibc.validationErrors.amount = validateAmount(amount, balance);
      });
    },
  };
};

export const ibcSelector = (state: AllSlices) => state.ibc;
