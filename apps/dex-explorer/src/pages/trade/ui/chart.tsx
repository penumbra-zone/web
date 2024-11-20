import cn from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, OhlcData } from 'lightweight-charts';
import { theme } from '@penumbra-zone/ui/theme';
import { Text } from '@penumbra-zone/ui/Text';
import { useCandles } from '../api/candles';
import { observer } from 'mobx-react-lite';
import { DurationWindow, durationWindows } from '@/shared/utils/duration.ts';

const ChartLoadingState = () => {
  return (
    <div className='flex w-full h-full items-center justify-center'>
      <div className='text-gray-500'>Loading...</div>
    </div>
  );
};

const ChartData = observer(({ candles }: { candles: OhlcData[] }) => {
  const chartElRef = useRef<HTMLInputElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (chartElRef.current && !chartRef.current) {
      chartRef.current = createChart(chartElRef.current, {
        autoSize: true,
        layout: {
          textColor: theme.color.text.primary,
          background: {
            color: 'transparent',
          },
        },
        grid: {
          vertLines: {
            color: theme.color.other.tonalStroke,
          },
          horzLines: {
            color: theme.color.other.tonalStroke,
          },
        },
      });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [chartElRef]);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current
        .addCandlestickSeries({
          upColor: theme.color.success.light,
          downColor: theme.color.destructive.light,
          borderVisible: false,
          wickUpColor: theme.color.success.light,
          wickDownColor: theme.color.destructive.light,
        })
        .setData(candles);

      chartRef.current.timeScale().fitContent();
    }
  }, [chartRef, candles]);

  return <div className='h-full' ref={chartElRef} />;
});

export const Chart = observer(() => {
  const [duration, setDuration] = useState<DurationWindow>('1d');
  const { data, isLoading, error } = useCandles(duration);

  return (
    <div className='flex flex-col grow h-full'>
      <div className='flex gap-3 py-3 px-4 border-b border-b-other-solidStroke'>
        {durationWindows.map(w => (
          <button
            key={w}
            type='button'
            className={cn(
              'flex items-center h-4 hover:text-text-primary transition-colors',
              w === duration ? 'text-text-primary' : 'text-text-secondary',
            )}
            onClick={() => setDuration(w)}
          >
            <Text detail>{w}</Text>
          </button>
        ))}
      </div>

      {error && <div className='text-white'>Error loading pair selector: ${String(error)}</div>}

      <div className='grow w-full h-full max-h-full pt-2 pl-4 pb-4'>
        {isLoading && <ChartLoadingState />}
        {data && <ChartData candles={data} />}
      </div>
    </div>
  );
});
