import { SliceCreator } from '..';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { SwapExecution_Trace } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { DutchAuctionSlice, createDutchAuctionSlice } from './dutch-auction';
import { InstantSwapSlice, createInstantSwapSlice } from './instant-swap';
import { DurationOption } from './constants';

export interface SimulateSwapResult {
  output: ValueView;
  unfilled: ValueView;
  priceImpact: number | undefined;
  traces?: SwapExecution_Trace[];
  metadataByAssetId: Record<string, Metadata>;
}

export interface SwapSlice {
  assetIn: BalancesResponse | undefined;
  setAssetIn: (asset: BalancesResponse) => void;
  amount: string;
  setAmount: (amount: string) => void;
  assetOut: Metadata | undefined;
  setAssetOut: (metadata: Metadata) => void;
  dutchAuction: DutchAuctionSlice;
  instantSwap: InstantSwapSlice;
  duration: DurationOption;
  setDuration: (duration: DurationOption) => void;
}

export const createSwapSlice = (): SliceCreator<SwapSlice> => (set, get, store) => ({
  assetIn: undefined,
  setAssetIn: asset => {
    set(({ swap }) => {
      swap.assetIn = asset;
    });
  },
  assetOut: undefined,
  setAssetOut: metadata => {
    set(({ swap }) => {
      swap.assetOut = metadata;
    });
  },
  amount: '',
  setAmount: amount => {
    set(({ swap }) => {
      swap.amount = amount;
    });
  },
  txInProgress: false,
  dutchAuction: createDutchAuctionSlice()(set, get, store),
  instantSwap: createInstantSwapSlice()(set, get, store),
  duration: 'instant',
  setDuration: duration => {
    set(state => {
      state.swap.duration = duration;
    });
  },
});
