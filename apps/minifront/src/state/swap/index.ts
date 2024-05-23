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

interface Actions {
  setBalancesResponses: (balancesResponses: BalancesResponse[]) => void;
  setAssetIn: (asset: BalancesResponse) => void;
  setAmount: (amount: string) => void;
  setAssetOut: (metadata: Metadata) => void;
  setDuration: (duration: DurationOption) => void;
  reset: VoidFunction;
}

interface State {
  balancesResponses: BalancesResponse[];
  assets: Metadata[];
  assetIn?: BalancesResponse;
  amount: string;
  assetOut?: Metadata;
  duration: DurationOption;
  txInProgress: boolean;
}

interface Subslices {
  dutchAuction: DutchAuctionSlice;
  instantSwap: InstantSwapSlice;
}

const INITIAL_STATE: State = {
  amount: '',
  assets: [],
  balancesResponses: [],
  duration: 'instant',
  txInProgress: false,
};

export type SwapSlice = Actions & State & Subslices;

export const createSwapSlice = (): SliceCreator<SwapSlice> => (set, get, store) => ({
  ...INITIAL_STATE,
  setBalancesResponses: balancesResponses => {
    set(state => {
      state.swap.balancesResponses = balancesResponses;
    });
  },
  assetIn: undefined,
  setAssetIn: asset => {
    set(({ swap }) => {
      swap.assetIn = asset;
    });
  },
  setAssetOut: metadata => {
    set(({ swap }) => {
      swap.assetOut = metadata;
    });
  },
  setAmount: amount => {
    set(({ swap }) => {
      swap.amount = amount;
    });
  },
  dutchAuction: createDutchAuctionSlice()(set, get, store),
  instantSwap: createInstantSwapSlice()(set, get, store),
  setDuration: duration => {
    set(state => {
      state.swap.duration = duration;
    });
  },
  reset: () => {
    get().swap.dutchAuction.reset();
    get().swap.instantSwap.reset();
    set(state => {
      state.swap = {
        ...state.swap,
        ...INITIAL_STATE,
        // Preserve the duration, as that affects which type of swap we're doing
        duration: state.swap.duration,
      };
    });
  },
});
