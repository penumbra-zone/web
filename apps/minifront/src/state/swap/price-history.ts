import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { CandlestickData } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { getMetadataFromBalancesResponseOptional } from '@penumbra-zone/getters/balances-response';
import { AllSlices, SliceCreator } from '..';
import { sendCandlestickDataRequest } from './helpers';

interface Actions {
  load: (ac?: AbortController) => AbortController['abort'];
}

interface State {
  candles: CandlestickData[];
  endMetadata?: Metadata;
  startMetadata?: Metadata;
}

export type PriceHistorySlice = Actions & State;

const INITIAL_STATE: State = {
  candles: [],
};

export const createPriceHistorySlice = (): SliceCreator<PriceHistorySlice> => (set, get) => ({
  ...INITIAL_STATE,
  load: (ac = new AbortController()): AbortController['abort'] => {
    const { assetIn, assetOut } = get().swap;
    const startMetadata = getMetadataFromBalancesResponseOptional(assetIn);
    const endMetadata = assetOut;
    void sendCandlestickDataRequest(
      { startMetadata, endMetadata },
      // there's no UI to set limit yet, and most ranges don't always happen to
      // include price records. 2500 at least scales well when there is data
      2500n,
      ac.signal,
    ).then(data => {
      if (data)
        set(({ swap }) => {
          swap.priceHistory.startMetadata = startMetadata;
          swap.priceHistory.endMetadata = endMetadata;
          swap.priceHistory.candles = data;
        });
    });

    return () => ac.abort('Returned slice abort');
  },
});

export const priceHistorySelector = (state: AllSlices) => state.swap.priceHistory;
