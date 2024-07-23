import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb.js';
import { CandlestickDataResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb.js';
import { PRICE_RELEVANCE_THRESHOLDS } from '@penumbra-zone/types/assets';
import { createZQuery, ZQueryState } from '@penumbra-zone/zquery';
import { AllSlices, SliceCreator, useStore } from '..';
import { sendCandlestickDataRequest } from './helpers';

interface Actions {
  /**
   * History limit becomes the maximum width of the chart domain (block height).
   */
  setHistoryLimit: (limit: bigint) => void;
  /**
   * Setting history start will cause the chart domain to begin at the specified
   * block height and extend towards the present. Setting history start to
   * `undefined` or `0n` will cause the chart domain to end at the present block
   * height and extend towards the past.
   */
  setHistoryStart: (blockHeight?: bigint) => void;
}

export const { candles, useCandles, useRevalidateCandles } = createZQuery({
  name: 'candles',
  fetch: (
    startMetadata: Metadata | undefined,
    endMetadata: Metadata | undefined,
    historyLimit: bigint | undefined,
    historyStart: bigint | undefined,
  ) =>
    Promise.all([
      sendCandlestickDataRequest(startMetadata, endMetadata, historyLimit, historyStart),
      sendCandlestickDataRequest(endMetadata, startMetadata, historyLimit, historyStart),
    ]).then(([direct, inverse]) => ({ direct, inverse })),
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
  candles: ZQueryState<
    { direct: CandlestickDataResponse; inverse: CandlestickDataResponse },
    Parameters<typeof sendCandlestickDataRequest>
  >;
  historyLimit: bigint;
  historyStart?: bigint;
}

export type PriceHistorySlice = Actions & State;

const INITIAL_STATE: Omit<State, 'pair'> = {
  candles,
  historyLimit: PRICE_RELEVANCE_THRESHOLDS.default,
};

export const createPriceHistorySlice = (): SliceCreator<PriceHistorySlice> => () => ({
  ...INITIAL_STATE,
  setHistoryLimit: blocks => {
    useStore.setState(state => {
      state.swap.priceHistory.historyLimit = blocks;
    });
  },
  setHistoryStart: blockHeight => {
    useStore.setState(state => {
      state.swap.priceHistory.historyStart = blockHeight;
    });
  },
});

export const priceHistorySelector = (state: AllSlices) => state.swap.priceHistory;
