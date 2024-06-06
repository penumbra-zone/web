import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { SwapExecution_Trace } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { SliceCreator } from '..';
import { DurationOption } from './constants';
import { DutchAuctionSlice, createDutchAuctionSlice } from './dutch-auction';
import { InstantSwapSlice, createInstantSwapSlice } from './instant-swap';
import { PriceHistorySlice, createPriceHistorySlice } from './price-history';

export interface SimulateSwapResult {
  metadataByAssetId: Record<string, Metadata>;
  output: ValueView;
  priceImpact: number | undefined;
  traces?: SwapExecution_Trace[];
  unfilled: ValueView;
}

interface Actions {
  resetSubslices: VoidFunction;
  setAmount: (amount: string) => void;
  setAssetIn: (asset: BalancesResponse) => void;
  setAssetOut: (metadata: Metadata) => void;
  setBalancesResponses: (balancesResponses: BalancesResponse[]) => void;
  setDuration: (duration: DurationOption) => void;
  setSwappableAssets: (assets: Metadata[]) => void;
}

interface State {
  amount: string;
  assetIn?: BalancesResponse;
  assetOut?: Metadata;
  balancesResponses: BalancesResponse[];
  duration: DurationOption;
  swappableAssets: Metadata[];
  txInProgress: boolean;
}

interface Subslices {
  dutchAuction: DutchAuctionSlice;
  instantSwap: InstantSwapSlice;
  priceHistory: PriceHistorySlice;
}

const INITIAL_STATE: State = {
  amount: '',
  balancesResponses: [],
  duration: 'instant',
  swappableAssets: [],
  txInProgress: false,
};

export type SwapSlice = Actions & State & Subslices;

export const createSwapSlice = (): SliceCreator<SwapSlice> => (set, get, store) => ({
  ...INITIAL_STATE,
  dutchAuction: createDutchAuctionSlice()(set, get, store),
  instantSwap: createInstantSwapSlice()(set, get, store),
  priceHistory: createPriceHistorySlice()(set, get, store),
  setBalancesResponses: balancesResponses => {
    set(state => {
      state.swap.balancesResponses = balancesResponses;
    });
  },
  setSwappableAssets: swappableAssets => {
    set(state => {
      state.swap.swappableAssets = swappableAssets;
    });
  },
  setAssetIn: asset => {
    get().swap.resetSubslices();
    set(({ swap }) => {
      swap.assetIn = asset;
    });
  },
  setAssetOut: metadata => {
    get().swap.resetSubslices();
    set(({ swap }) => {
      swap.assetOut = metadata;
    });
  },
  setAmount: amount => {
    get().swap.resetSubslices();
    set(({ swap }) => {
      swap.amount = amount;
    });
  },
  setDuration: duration => {
    get().swap.resetSubslices();
    set(state => {
      state.swap.duration = duration;
    });
  },
  resetSubslices: () => {
    get().swap.dutchAuction.reset();
    get().swap.instantSwap.reset();
  },
});
