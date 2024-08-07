import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb.js';
import { SwapExecution_Trace } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb.js';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';
import { AllSlices, SliceCreator } from '..';
import { DurationOption } from './constants';
import {
  createDutchAuctionSlice,
  DutchAuctionSlice,
  dutchAuctionSubmitButtonDisabledSelector,
} from './dutch-auction';
import {
  createInstantSwapSlice,
  InstantSwapSlice,
  instantSwapSubmitButtonDisabledSelector,
} from './instant-swap';
import { createPriceHistorySlice, PriceHistorySlice } from './price-history';
import { isValidAmount } from '../helpers';

import { setSwapQueryParams } from './query-params';
import { swappableBalancesResponsesSelector, swappableAssetsSelector } from './helpers';
import { getMetadataFromBalancesResponse } from '@penumbra-zone/getters/balances-response';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { emptyBalanceResponse } from '../../utils/empty-balance-response';
import {
  balancesResponseAndMetadataAreSameAsset,
  getFirstBalancesResponseMatchingMetadata,
  getFirstBalancesResponseNotMatchingMetadata,
  getFirstMetadataNotMatchingBalancesResponse,
  getBalanceByMatchingMetadataAndAddressIndex,
} from './getters';

export interface SimulateSwapResult {
  metadataByAssetId: Record<string, Metadata>;
  output: ValueView;
  priceImpact: number | undefined;
  traces?: SwapExecution_Trace[];
  unfilled: ValueView;
}

interface Actions {
  setAssetIn: (asset: BalancesResponse) => void;
  setAmount: (amount: string) => void;
  setAssetOut: (metadata?: Metadata) => void;
  reverse: () => void;
  setDuration: (duration: DurationOption) => void;
  resetSubslices: VoidFunction;
}

interface State {
  assetIn?: BalancesResponse;
  amount: string;
  assetOut?: Metadata;
  duration: DurationOption;
  txInProgress: boolean;
}

interface Subslices {
  dutchAuction: DutchAuctionSlice;
  instantSwap: InstantSwapSlice;
  priceHistory: PriceHistorySlice;
}

const INITIAL_STATE: State = {
  amount: '',
  duration: 'instant',
  txInProgress: false,
};

export type SwapSlice = Actions & State & Subslices;

export const createSwapSlice = (): SliceCreator<SwapSlice> => (set, get, store) => ({
  ...INITIAL_STATE,
  dutchAuction: createDutchAuctionSlice()(set, get, store),
  instantSwap: createInstantSwapSlice()(set, get, store),
  priceHistory: createPriceHistorySlice()(set, get, store),
  setAssetIn: asset => {
    get().swap.resetSubslices();
    set(({ swap }) => {
      swap.assetIn = asset;

      if (balancesResponseAndMetadataAreSameAsset(asset, get().swap.assetOut)) {
        swap.assetOut = getFirstMetadataNotMatchingBalancesResponse(
          swappableAssetsSelector(get().shared.assets).data ?? [],
          asset,
        );
      }
    });
    setSwapQueryParams(get());
  },
  setAssetOut: metadata => {
    get().swap.resetSubslices();
    set(({ swap }) => {
      swap.assetOut = metadata;

      if (balancesResponseAndMetadataAreSameAsset(get().swap.assetIn, metadata)) {
        swap.assetIn = getFirstBalancesResponseNotMatchingMetadata(
          swappableBalancesResponsesSelector(get().shared.balancesResponses).data ?? [],
          metadata,
        );
      }
    });
    setSwapQueryParams(get());
  },
  reverse: () => {
    get().swap.resetSubslices();
    set(({ swap }) => {
      const balances = get().shared.balancesResponses.data ?? [];
      const assetIn = get().swap.assetIn;
      const assetOut = get().swap.assetOut;
      if (!assetIn || !assetOut) {
        return;
      }

      swap.assetIn =
        getBalanceByMatchingMetadataAndAddressIndex(
          balances,
          getAddressIndex(assetIn.accountAddress),
          assetOut,
        ) ??
        getFirstBalancesResponseMatchingMetadata(balances, assetOut) ??
        emptyBalanceResponse(assetOut);
      swap.assetOut = getMetadataFromBalancesResponse(get().swap.assetIn);
    });
    setSwapQueryParams(get());
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

export const submitButtonDisabledSelector = (state: AllSlices) =>
  !state.swap.amount ||
  !isValidAmount(state.swap.amount, state.swap.assetIn) ||
  dutchAuctionSubmitButtonDisabledSelector(state) ||
  instantSwapSubmitButtonDisabledSelector(state);
