import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { SwapExecution_Trace } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { AllSlices, SliceCreator, useStore } from '..';
import { DurationOption } from './constants';
import {
  DutchAuctionSlice,
  createDutchAuctionSlice,
  dutchAuctionSubmitButtonDisabledSelector,
} from './dutch-auction';
import {
  InstantSwapSlice,
  createInstantSwapSlice,
  instantSwapSubmitButtonDisabledSelector,
} from './instant-swap';
import { PriceHistorySlice, createPriceHistorySlice } from './price-history';
import { getMetadata } from '@penumbra-zone/getters/value-view';
import { ZQueryState, createZQuery } from '@penumbra-zone/zquery';
import { getSwappableBalancesResponses, isSwappable } from '../../components/swap/helpers';
import { getAllAssets } from '../../fetchers/assets';

export const { balancesResponses, useBalancesResponses } = createZQuery({
  name: 'balancesResponses',
  fetch: async () => {
    const balancesResponses = await getSwappableBalancesResponses();

    if (balancesResponses[0] && !useStore.getState().swap.assetIn) {
      useStore.getState().swap.setAssetIn(balancesResponses[0]);
    }

    return balancesResponses;
  },
  getUseStore: () => useStore,
  get: state => state.swap.balancesResponses,
  set: setter => {
    const newState = setter(useStore.getState().swap.balancesResponses);
    useStore.setState(state => {
      state.swap.balancesResponses = newState;
    });
  },
});

export const { swappableAssets, useSwappableAssets } = createZQuery({
  name: 'swappableAssets',
  fetch: async () => {
    const allAssets = await getAllAssets();
    const swappableAssets = allAssets.filter(isSwappable);

    if (swappableAssets[0] && !useStore.getState().swap.assetOut) {
      useStore.getState().swap.setAssetOut(swappableAssets[0]);
    }

    return swappableAssets;
  },
  getUseStore: () => useStore,
  get: state => state.swap.swappableAssets,
  set: setter => {
    const newState = setter(useStore.getState().swap.swappableAssets);
    useStore.setState(state => {
      state.swap.swappableAssets = newState;
    });
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
  setAssetOut: (metadata: Metadata) => void;
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
  dutchAuctionSubmitButtonDisabledSelector(state) ||
  instantSwapSubmitButtonDisabledSelector(state);
