import { getMetadataFromBalancesResponse } from '@penumbra-zone/getters/balances-response';
import { AbridgedZQueryState } from '@penumbra-zone/zquery/src/types';
import { Box } from '@penumbra-zone/ui-old/components/ui/box';
import { CandlestickPlot } from '@penumbra-zone/ui-old/components/ui/candlestick-plot';
import { useEffect, useMemo, useState } from 'react';
import { getBlockDate } from '../../../fetchers/block-date';
import { AllSlices } from '../../../state';
import { useStatus } from '../../../state/status';
import { combinedCandlestickDataSelector } from '../../../state/swap/helpers';
import { useCandles, useRevalidateCandles } from '../../../state/swap/price-history';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { Button } from '@penumbra-zone/ui-old/components/ui/button';

const priceHistorySelector = (state: AllSlices) => ({
  startMetadata: getMetadataFromBalancesResponse.optional(state.swap.assetIn),
  endMetadata: state.swap.assetOut,
  historyLimit: state.swap.priceHistory.historyLimit,
  historyStart: state.swap.priceHistory.historyStart,
});

const latestKnownBlockHeightSelector = (
  state: AbridgedZQueryState<{
    fullSyncHeight?: bigint;
    latestKnownBlockHeight?: bigint;
  }>,
) => state.data?.latestKnownBlockHeight;

export const PriceHistory = () => {
  const { startMetadata, endMetadata, historyLimit, historyStart } =
    useStoreShallow(priceHistorySelector);
  const latestKnownBlockHeight = useStatus({ select: latestKnownBlockHeightSelector });

  const [lastCandlesUpdate, setLastCandlesUpdate] = useState<bigint>();
  const [staleCandles, setStaleCandles] = useState<boolean>();
  const [pauseAtHeight, setPauseAtHeight] = useState<bigint>();

  const candles = useCandles(
    { select: combinedCandlestickDataSelector },
    startMetadata,
    endMetadata,
    historyLimit,
    undefined,
  );

  const refetchCandles = useRevalidateCandles();

  const candleRefetchArgs: Parameters<typeof refetchCandles> = useMemo(() => {
    // args changes require refetch
    setStaleCandles(true);
    return [startMetadata, endMetadata, historyLimit, undefined];
  }, [startMetadata, endMetadata, historyLimit]);

  // auto-update and rate limit candlestick data
  useEffect(() => {
    if (!staleCandles && latestKnownBlockHeight && lastCandlesUpdate) {
      setStaleCandles(latestKnownBlockHeight - lastCandlesUpdate > 10n);
    }
  }, [lastCandlesUpdate, latestKnownBlockHeight, pauseAtHeight, staleCandles]);

  useEffect(() => {
    if (staleCandles && !pauseAtHeight) {
      setStaleCandles(false);
      setLastCandlesUpdate(latestKnownBlockHeight);
      refetchCandles(...candleRefetchArgs);
    }
  }, [candleRefetchArgs, latestKnownBlockHeight, pauseAtHeight, refetchCandles, staleCandles]);

  const [startBlock, endBlock] = useMemo(() => {
    const atHeight = pauseAtHeight ?? latestKnownBlockHeight;
    if (atHeight) {
      return historyStart ? [historyStart, historyLimit] : [atHeight - historyLimit, atHeight];
    } else {
      return [];
    }
  }, [pauseAtHeight, latestKnownBlockHeight, historyStart, historyLimit]);

  if (!latestKnownBlockHeight || !candles?.data || !startMetadata || !endMetadata) {
    return;
  }

  return (
    <Box
      label='Price History'
      headerContent={
        <Button
          type='button'
          variant={pauseAtHeight ? 'onLight' : 'secondary'}
          size='sm'
          onClick={() => setPauseAtHeight(a => (a ? undefined : latestKnownBlockHeight))}
        >
          Pause
        </Button>
      }
    >
      {candles.data.length ? (
        <div className='text-sm'>Since block {String(startBlock)}</div>
      ) : (
        <div className='text-sm'>No recent price data</div>
      )}
      <CandlestickPlot
        className='h-[240px] w-full'
        candles={candles.data}
        startMetadata={startMetadata}
        endMetadata={endMetadata}
        blockDomain={[startBlock ?? 0n, endBlock ?? latestKnownBlockHeight]}
        getBlockDate={getBlockDate}
      />
    </Box>
  );
};
