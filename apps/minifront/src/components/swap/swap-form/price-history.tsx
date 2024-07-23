import { getMetadataFromBalancesResponseOptional } from '@penumbra-zone/getters/balances-response';
import { AbridgedZQueryState } from '@penumbra-zone/zquery/src/types';
import { Box } from '@repo/ui/components/ui/box';
import { CandlestickPlot } from '@repo/ui/components/ui/candlestick-plot';
import { useEffect, useMemo, useState } from 'react';
import { getBlockDate } from '../../../fetchers/block-date';
import { AllSlices } from '../../../state';
import { useStatus } from '../../../state/status';
import { combinedCandlestickDataSelector } from '../../../state/swap/helpers';
import { useCandles, useRevalidateCandles } from '../../../state/swap/price-history';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { Button } from '@repo/ui/components/ui/button';

const priceHistoryRequestSelector = (state: AllSlices) => ({
  startMetadata: getMetadataFromBalancesResponseOptional(state.swap.assetIn),
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
  const { startMetadata, endMetadata, historyLimit, historyStart } = useStoreShallow(
    priceHistoryRequestSelector,
  );
  const latestKnownBlockHeight = useStatus({ select: latestKnownBlockHeightSelector });

  const [lastCandlesUpdate, setLastCandlesUpdate] = useState<bigint>();
  const [staleCandles, setStaleCandles] = useState<boolean>();
  const [pause, setPause] = useState<bigint>();

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
  }, [lastCandlesUpdate, latestKnownBlockHeight, pause, staleCandles]);

  useEffect(() => {
    if (staleCandles && !pause) {
      setStaleCandles(false);
      setLastCandlesUpdate(latestKnownBlockHeight);
      refetchCandles(...candleRefetchArgs);
    }
  }, [candleRefetchArgs, latestKnownBlockHeight, pause, refetchCandles, staleCandles]);

  const [startBlock, endBlock] = useMemo(() => {
    const atHeight = pause ?? latestKnownBlockHeight;
    if (atHeight) {
      return historyStart ? [historyStart, historyLimit] : [atHeight - historyLimit, atHeight];
    } else {
      return [];
    }
  }, [pause, latestKnownBlockHeight, historyStart, historyLimit]);

  if (latestKnownBlockHeight && candles?.data && startMetadata && endMetadata) {
    return (
      <Box
        label='Price History'
        headerContent={
          <Button
            type='button'
            variant={pause ? 'onLight' : 'secondary'}
            size='sm'
            onClick={() => setPause(a => (a ? undefined : latestKnownBlockHeight))}
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
  } else {
    return undefined;
  }
};
