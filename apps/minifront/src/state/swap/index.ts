import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { SwapExecution_Trace } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { AllSlices, Middleware, SliceCreator } from '..';
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
import { getMetadata } from '@penumbra-zone/getters/value-view';
import { isValidAmount } from '../helpers';

import { setSwapQueryParams } from './query-params';
import { swappableBalancesResponsesSelector, swappableAssetsSelector } from './helpers';
import { getMetadataFromBalancesResponse } from '@penumbra-zone/getters/balances-response';

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

const balancesResponseAndMetadataAreSameAsset = (
  balancesResponse?: BalancesResponse,
  metadata?: Metadata,
) => getMetadata.optional()(balancesResponse?.balanceView)?.equals(metadata);

const getFirstBalancesResponseNotMatchingMetadata = (
  balancesResponses: BalancesResponse[],
  metadata?: Metadata,
) =>
  balancesResponses.find(
    balancesResponse => !balancesResponseAndMetadataAreSameAsset(balancesResponse, metadata),
  );

const getFirstMetadataNotMatchingBalancesResponse = (
  metadatas: Metadata[],
  balancesResponse: BalancesResponse,
) =>
  metadatas.find(metadata => !balancesResponseAndMetadataAreSameAsset(balancesResponse, metadata));

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

export const swapBalancesMiddleware: Middleware = f => (set, get, store) => {
  const modifiedSetter: typeof set = (...args) => {
    const before = swappableBalancesResponsesSelector(get().shared.balancesResponses).data;
    set(...args);
    const after = swappableBalancesResponsesSelector(get().shared.balancesResponses).data;

    const balancesResponsesWereJustSet = !before?.length && !!after?.length;
    const assetInNotYetSelected = !get().swap.assetIn;

    if (balancesResponsesWereJustSet && assetInNotYetSelected) {
      const firstBalanceDifferentFromAssetOut = after.find(
        balancesResponse =>
          getMetadataFromBalancesResponse
            .optional()(balancesResponse)
            ?.equals(get().swap.assetOut) === false,
      );

      set(state => ({
        ...state,
        swap: {
          ...state.swap,
          assetIn: firstBalanceDifferentFromAssetOut,
        },
      }));
    }
  };

  store.setState = modifiedSetter;

  return f(modifiedSetter, get, store);
};

export const swapAssetsMiddleware: Middleware = f => (set, get, store) => {
  const modifiedSetter: typeof set = (...args) => {
    const before = swappableAssetsSelector(get().shared.assets).data;

    set(...args);
    const after = swappableAssetsSelector(get().shared.assets).data;

    const assetsWereJustSet = !before?.length && !!after?.length;
    const assetOutNotYetSelected = !get().swap.assetOut;

    if (assetsWereJustSet && assetOutNotYetSelected) {
      const firstAssetDifferentFromAssetIn = after.find(
        metadata =>
          !metadata.equals(getMetadataFromBalancesResponse.optional()(get().swap.assetIn)),
      );

      set(state => ({
        ...state,
        swap: {
          ...state.swap,
          assetOut: firstAssetDifferentFromAssetIn,
        },
      }));
    }
  };

  store.setState = modifiedSetter;

  return f(modifiedSetter, get, store);
};
