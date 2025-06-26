import cn from 'clsx';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { theme } from '@penumbra-zone/ui/theme';
import { Text } from '@penumbra-zone/ui/Text';
import { DurationWindow, durationWindows } from '@/shared/utils/duration.ts';
import { BlockchainError } from '@/shared/ui/blockchain-error';
import { useCandles } from '../../api/candles';
import { ChartLoadingState } from './loading-chart';
import { useChartConfig } from './use-chart-config';

export const Chart = observer(() => {
  const [duration, setDuration] = useState<DurationWindow>('1d');
  const { data, isLoading, error, fetchNextPage, isFetchingNextPage } = useCandles(duration);
  const candles = data?.pages.flat();

  const { chartRef, setVolumeData, setCandlesData } = useChartConfig(
    fetchNextPage,
    isFetchingNextPage,
  );

  useEffect(() => {
    if (!candles?.length) {
      return;
    }

    setCandlesData(candles.map(c => c.ohlc));
    setVolumeData(
      candles.map(candle => ({
        time: candle.ohlc.time,
        value: candle.volume,
        color:
          candle.ohlc.close >= candle.ohlc.open
            ? theme.color.success.light + '80'
            : theme.color.destructive.light + '80',
      })),
    );
  }, [candles, setCandlesData, setVolumeData]);

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
        {!error && !isLoading && candles && <div className='h-full w-full' ref={chartRef} />}
      </div>
    </div>
  );
});
