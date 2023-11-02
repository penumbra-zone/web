import { assets } from '@penumbra-zone/constants';
import { Asset, AssetId, Chain } from '@penumbra-zone/types';
import { AllSlices, SliceCreator } from '.';

export interface IbcSendSlice {
  asset: Asset;
  setAsset: (asset: AssetId) => void;
  amount: string;
  setAmount: (amount: string) => void;
  chain: Chain | undefined;
  setChain: (chain: Chain | undefined) => void;
}

export const createIbcSendSlice = (): SliceCreator<IbcSendSlice> => set => {
  return {
    amount: '',
    asset: assets[0]!,
    chain: undefined,
    setAmount: amount => {
      set(state => {
        state.ibc.amount = amount;
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
  };
};

export const ibcSelector = (state: AllSlices) => state.ibc;
