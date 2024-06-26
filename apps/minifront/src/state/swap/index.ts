import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { SwapExecution_Trace } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { AllSlices, SliceCreator, useStore } from '..';
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
import { createZQuery, ZQueryState } from '@penumbra-zone/zquery';
import { getSwappableBalancesResponses, isSwappable } from '../../components/swap/helpers';
import { getAllAssets } from '../../fetchers/assets';
import { isValidAmount } from '../helpers';
import { setInitialAssets } from './set-initial-assets';

export const { balancesResponses, useBalancesResponses } = createZQuery({
  name: 'balancesResponses',
  fetch: () => getSwappableBalancesResponses(),
  getUseStore: () => useStore,
  get: state => state.swap.balancesResponses,
  set: setter => {
    const newState = setter(useStore.getState().swap.balancesResponses);
    useStore.setState(state => {
      state.swap.balancesResponses = newState;
    });
    setInitialAssets(useStore.getState().swap);
  },
});

export const { swappableAssets, useSwappableAssets } = createZQuery({
  name: 'swappableAssets',
  fetch: async () => {
    const allAssets = await getAllAssets();
    return allAssets.filter(isSwappable);
  },
  getUseStore: () => useStore,
  get: state => state.swap.swappableAssets,
  set: setter => {
    const newState = setter(useStore.getState().swap.swappableAssets);
    useStore.setState(state => {
      state.swap.swappableAssets = newState;
    });
    setInitialAssets(useStore.getState().swap);
  },
});

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
  balancesResponses: ZQueryState<BalancesResponse[]>;
  swappableAssets: ZQueryState<Metadata[]>;
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
  swappableAssets,
  balancesResponses,
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
          get().swap.swappableAssets.data ?? [],
          asset,
        );
      }
    });
  },
  setAssetOut: metadata => {
    get().swap.resetSubslices();
    set(({ swap }) => {
      swap.assetOut = metadata;

      if (balancesResponseAndMetadataAreSameAsset(get().swap.assetIn, metadata)) {
        swap.assetIn = getFirstBalancesResponseNotMatchingMetadata(
          get().swap.balancesResponses.data ?? [],
          metadata,
        );
      }
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

export const submitButtonDisabledSelector = (state: AllSlices) =>
  !state.swap.amount ||
  !isValidAmount(state.swap.amount, state.swap.assetIn) ||
  dutchAuctionSubmitButtonDisabledSelector(state) ||
  instantSwapSubmitButtonDisabledSelector(state);
