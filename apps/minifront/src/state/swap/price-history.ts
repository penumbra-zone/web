import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb.js';
import { CandlestickData } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb.js';
import { getMetadataFromBalancesResponseOptional } from '@penumbra-zone/getters/balances-response';
import { AllSlices, SliceCreator, useStore } from '..';
import { sendCandlestickDataRequests } from './helpers';
import { PRICE_RELEVANCE_THRESHOLDS } from '@penumbra-zone/types/assets';
import { createZQuery, ZQueryState } from '@penumbra-zone/zquery';

interface Actions {
  load: (ac?: AbortController) => AbortController['abort'];
}

export const { candles, useCandles, useRevalidateCandles } = createZQuery({
  name: 'candles',
  fetch: () => {
    const { assetIn, assetOut } = useStore.getState().swap;
    const startMetadata = getMetadataFromBalancesResponseOptional(assetIn);
    const endMetadata = assetOut;
    return sendCandlestickDataRequests(
      { startMetadata, endMetadata },
      // there's no UI to set limit yet, and any given range won't always happen
      // to include price records.
      PRICE_RELEVANCE_THRESHOLDS.default * 2n,
      useStore.getState().swap.priceHistory.candles._zQueryInternal.abortController?.signal,
    );
  },
  getUseStore: () => useStore,
  get: state => state.swap.priceHistory.candles,
  set: setter => {
    const newState = setter(useStore.getState().swap.priceHistory.candles);
    useStore.setState(state => {
      state.swap.priceHistory.candles = newState;
    });
  },
});

interface State {
  candles: ZQueryState<CandlestickData[]>;
  endMetadata?: Metadata;
  startMetadata?: Metadata;
}

export type PriceHistorySlice = Actions & State;

const INITIAL_STATE: State = {
  candles,
};

export const createPriceHistorySlice = (): SliceCreator<PriceHistorySlice> => (set, get) => ({
  ...INITIAL_STATE,
  load: (ac = new AbortController()): AbortController['abort'] => {
    const { assetIn, assetOut } = get().swap;
    const startMetadata = getMetadataFromBalancesResponseOptional(assetIn);
    const endMetadata = assetOut;
    void sendCandlestickDataRequests(
      { startMetadata, endMetadata },
      // there's no UI to set limit yet, and any given range won't always happen
      // to include price records.
      PRICE_RELEVANCE_THRESHOLDS.default * 2n,
      ac.signal,
    ).then(candles => {
      set(({ swap }) => {
        swap.priceHistory.startMetadata = startMetadata;
        swap.priceHistory.endMetadata = endMetadata;
        // swap.priceHistory.candles = candles;
      });
    });

    return () => ac.abort('Returned slice abort');
  },
});

export const priceHistorySelector = (state: AllSlices) => state.swap.priceHistory;
