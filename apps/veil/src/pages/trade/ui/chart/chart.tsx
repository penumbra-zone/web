import cn from 'clsx';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import { Text } from '@penumbra-zone/ui/Text';
import { DurationWindow, durationWindows } from '@/shared/utils/duration.ts';
import { BlockchainError } from '@/shared/ui/blockchain-error';
import { useInfiniteCandles } from '../../api/infinite-candles';
import { useLatestCandles } from '../../api/latest-candles';
import { ChartLoadingState } from './loading-chart';
import { useChartConfig } from './use-chart-config';

export const Chart = observer(() => {
  const [duration, setDuration] = useState<DurationWindow>('1d');

  // we need two queries to avoid overfetching. if we leave only the infinite query, it will
  // be requested PAGE times on each block, causing many unnecessary requests.
  const { data: latestCandles } = useLatestCandles(duration);
  const { data: historyCandles, isLoading, error, fetchNextPage } = useInfiniteCandles(duration);

  const isFetching = useRef(false);
  const fetchNext = async () => {
    isFetching.current = true;
    await fetchNextPage();
    isFetching.current = false;
  };

  const { chartRef, setVolumeData, setCandlesData } = useChartConfig(fetchNext, isFetching);

  useEffect(() => {
    if (!latestCandles?.length) {
      return;
    }
    setCandlesData(latestCandles);
  }, [latestCandles, setCandlesData]);

  useEffect(() => {
    if (!historyCandles?.pages.length) {
      return;
    }

    // pages need to be reversed, so that data is always in ASC order
    const candles = historyCandles.pages.toReversed().flat();
    setCandlesData(candles);
    setVolumeData(candles);
  }, [historyCandles, setCandlesData, setVolumeData]);

  return (
    <div className='flex h-full min-h-0 flex-col'>
      <div className='flex border-b border-b-other-solid-stroke px-3'>
        {durationWindows.map(w => (
          <button
            key={w}
            type='button'
            className={cn(
              'flex items-center rounded px-1.5 py-3 transition-colors hover:bg-action-hover-overlay hover:text-text-primary',
              w === duration ? 'bg-action-active-overlay text-text-primary' : 'text-text-secondary',
            )}
            onClick={() => setDuration(w)}
          >
            <Text detail>{w}</Text>
          </button>
        ))}
      </div>

      <div className='flex min-h-0 grow items-center justify-center'>
        {error && <BlockchainError direction='column' />}
        {!error && isLoading && <ChartLoadingState />}
        {!error && !isLoading && historyCandles && <div className='h-full w-full' ref={chartRef} />}
      </div>
    </div>
  );
});
