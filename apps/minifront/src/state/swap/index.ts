import { SliceCreator } from '..';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import {
  CandlestickData,
  SwapExecution_Trace,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { DutchAuctionSlice, createDutchAuctionSlice } from './dutch-auction';
import { InstantSwapSlice, createInstantSwapSlice } from './instant-swap';
import { DurationOption } from './constants';
import { sendCandlestickDataRequest } from './helpers';

export interface SimulateSwapResult {
  output: ValueView;
  unfilled: ValueView;
  priceImpact: number | undefined;
  traces?: SwapExecution_Trace[];
  metadataByAssetId: Record<string, Metadata>;
}

interface Actions {
  setBalancesResponses: (balancesResponses: BalancesResponse[]) => void;
  setSwappableAssets: (assets: Metadata[]) => void;
  setAssetIn: (asset: BalancesResponse) => void;
  setAmount: (amount: string) => void;
  setAssetOut: (metadata: Metadata) => void;
  setDuration: (duration: DurationOption) => void;
  resetSubslices: VoidFunction;
  loadCandlestick: () => Promise<void>;
}

interface State {
  balancesResponses: BalancesResponse[];
  swappableAssets: Metadata[];
  assetIn?: BalancesResponse;
  amount: string;
  assetOut?: Metadata;
  duration: DurationOption;
  txInProgress: boolean;
  candlestick: {
    abort: AbortController['abort'];
    data: CandlestickData[];
    loading: boolean;
  };
}

interface Subslices {
  dutchAuction: DutchAuctionSlice;
  instantSwap: InstantSwapSlice;
}

const INITIAL_STATE: State = {
  amount: '',
  swappableAssets: [],
  balancesResponses: [],
  duration: 'instant',
  txInProgress: false,
  candlestick: {
    abort: () => void 0,
    data: [],
    loading: false,
  },
};

export type SwapSlice = Actions & State & Subslices;

export const createSwapSlice = (): SliceCreator<SwapSlice> => (set, get, store) => ({
  ...INITIAL_STATE,
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
  assetIn: undefined,
  setAssetIn: asset => {
    get().swap.resetSubslices();
    set(({ swap }) => {
      swap.assetIn = asset;
    });
    get().swap.loadCandlestick();
  },
  setAssetOut: metadata => {
    get().swap.resetSubslices();
    set(({ swap }) => {
      swap.assetOut = metadata;
    });
    get().swap.loadCandlestick();
  },
  setAmount: amount => {
    get().swap.resetSubslices();
    set(({ swap }) => {
      swap.amount = amount;
    });
  },
  dutchAuction: createDutchAuctionSlice()(set, get, store),
  instantSwap: createInstantSwapSlice()(set, get, store),
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
  candlestick: {
    abort: () => void 0,
    loading: false,
    data: [],
  },
  loadCandlestick: async () => {
    const abortThisLoad = new AbortController();

    const {
      assetIn,
      assetOut,
      candlestick: { loading, abort: abortOldLoad },
    } = get().swap;

    if (loading) abortOldLoad();

    set(({ swap }) => {
      swap.candlestick.data = [];
      swap.candlestick.abort = () => abortThisLoad.abort('Slice abort');
      swap.candlestick.loading = true;
    });

    try {
      const { data } = await sendCandlestickDataRequest(
        { assetIn, assetOut },
        abortThisLoad.signal,
      );
      set(({ swap }) => {
        swap.candlestick.data = data;
      });
    } finally {
      set(({ swap }) => {
        swap.candlestick.loading = false;
      });
    }
  },
});
