import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, OhlcData } from 'lightweight-charts';
import { tailwindConfig } from '@penumbra-zone/ui/tailwind';
import { useCandles } from '../api/candles';
import { observer } from 'mobx-react-lite';
import { DurationWindow, durationWindows } from '@/shared/database/schema.ts';
import { Button } from '@penumbra-zone/ui/Button';

const { colors } = tailwindConfig.theme.extend;

const CHART_HEIGHT = 512;

const ChartLoadingState = () => {
  return (
    <div style={{ height: CHART_HEIGHT }}>
      <div className='flex w-full items-center justify-center' style={{ height: CHART_HEIGHT }}>
        <div className='text-gray-500'>Loading...</div>
      </div>
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
          textColor: colors.text.primary,
          background: {
            color: 'transparent',
          },
        },
        grid: {
          vertLines: {
            color: colors.other.tonalStroke,
          },
          horzLines: {
            color: colors.other.tonalStroke,
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
          upColor: colors.success.light,
          downColor: colors.destructive.light,
          borderVisible: false,
          wickUpColor: colors.success.light,
          wickDownColor: colors.destructive.light,
        })
        .setData(candles);

      chartRef.current.timeScale().fitContent();
    }
  }, [chartRef, candles]);

  return <div ref={chartElRef} style={{ height: CHART_HEIGHT }}></div>;
});

export const Chart = observer(() => {
  const [duration, setDuration] = useState<DurationWindow>('1d');
  const { data, isLoading, error } = useCandles(duration);

  return (
    <div>
      <div className='flex gap-2 w-1/2'>
        {durationWindows.map(w => (
          <Button
            key={w}
            actionType={w === duration ? 'accent' : 'default'}
            onClick={() => setDuration(w)}
          >
            {w}
          </Button>
        ))}
      </div>
      {error && <div className='text-white'>Error loading pair selector: ${String(error)}</div>}
      {isLoading && <ChartLoadingState />}
      {data && <ChartData candles={data} />}
    </div>
  );
});
