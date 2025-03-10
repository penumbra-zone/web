import cn from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';
import { theme } from '@penumbra-zone/ui/theme';
import { Text } from '@penumbra-zone/ui/Text';
import { useCandles } from '../api/candles';
import { observer } from 'mobx-react-lite';
import { DurationWindow, durationWindows } from '@/shared/utils/duration.ts';
import { CandleWithVolume } from '@/shared/api/server/candles/utils';
import { BlockchainError } from '@/shared/ui/blockchain-error';

const ChartLoadingState = () => {
  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .chart-loading-fade-in {
            animation: fadeIn 0.5s ease-in-out;
          }
        `}
      </style>
      <svg
        overflow={'visible'}
        width='100%'
        height='100%'
        viewBox='0 0 328 164'
        preserveAspectRatio='xMidYMid meet'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='chart-loading-fade-in'
      >
        <defs>
          <linearGradient
            id='chart-gradient'
            x1='0'
            y1='0.5'
            x2='1'
            y2='0.5'
            gradientUnits='objectBoundingBox'
          >
            <stop offset='0%' stopColor='#FAFAFA' stopOpacity='0.05'>
              <animate
                attributeName='stop-opacity'
                values='0.05;0.15;0.05'
                dur='2s'
                repeatCount='indefinite'
              />
            </stop>
            <stop offset='100%' stopColor='#FAFAFA' stopOpacity='0.1'>
              <animate
                attributeName='stop-opacity'
                values='0.1;0.2;0.1'
                dur='2s'
                repeatCount='indefinite'
              />
            </stop>
          </linearGradient>
        </defs>
        <path
          d='M 81.621 75.076 L 81.621 99.686 L 83.432 99.686 L 83.432 75.076 L 90.674 75.076 L 90.674 53.982 L 83.432 53.982 L 83.432 13.551 L 81.621 13.551 L 81.621 53.982 L 74.379 53.982 L 74.379 75.076 L 81.621 75.076 Z'
          fill='url(#chart-gradient)'
        ></path>
        <path
          d='M 105.158 136.598 L 105.158 162.852 L 106.969 162.852 L 106.969 136.598 L 114.211 136.598 L 114.211 75.073 L 106.969 75.073 L 106.969 57.494 L 105.158 57.494 L 105.158 75.073 L 97.916 75.073 L 97.916 136.598 L 105.158 136.598 Z'
          fill='url(#chart-gradient)'
        ></path>
        <path
          d='M 12.821 69.8 L 20.063 69.8 L 20.063 111.989 L 12.821 111.989 L 12.821 117.262 L 11.011 117.262 L 11.011 111.989 L 3.769 111.989 L 3.769 69.8 L 11.011 69.8 L 11.011 66.284 L 12.821 66.284 L 12.821 69.8 Z'
          fill='url(#chart-gradient)'
        ></path>
        <path
          d='M 316.99 55.848 L 324.232 55.848 L 324.232 96.169 L 316.99 96.169 L 316.99 106.717 L 315.179 106.717 L 315.179 96.169 L 307.937 96.169 L 307.937 55.848 L 315.179 55.848 L 315.179 52.333 L 316.99 52.333 L 316.99 55.848 Z'
          fill='url(#chart-gradient)'
        ></path>
        <path
          d='M 269.916 40.03 L 277.158 40.03 L 277.158 75.187 L 269.916 75.187 L 269.916 76.945 L 268.106 76.945 L 268.106 75.187 L 260.864 75.187 L 260.864 40.03 L 268.106 40.03 L 268.106 36.514 L 269.916 36.514 L 269.916 40.03 Z'
          fill='url(#chart-gradient)'
        ></path>
        <path
          d='M 222.843 52.333 L 230.085 52.333 L 230.085 68.154 L 222.843 68.154 L 222.843 92.654 L 221.032 92.654 L 221.032 68.154 L 213.79 68.154 L 213.79 52.333 L 221.032 52.333 L 221.032 9.938 L 222.843 9.938 L 222.843 52.333 Z'
          fill='url(#chart-gradient)'
        ></path>
        <path
          d='M 201.116 34.754 L 208.358 34.754 L 208.358 43.543 L 201.116 43.543 L 201.116 61.122 L 199.306 61.122 L 199.306 43.543 L 192.064 43.543 L 192.064 34.754 L 199.306 34.754 L 199.306 8.18 L 201.116 8.18 L 201.116 34.754 Z'
          fill='url(#chart-gradient)'
        ></path>
        <path
          d='M 177.579 43.545 L 184.821 43.545 L 184.821 66.397 L 177.579 66.397 L 177.579 83.866 L 175.769 83.866 L 175.769 66.397 L 168.527 66.397 L 168.527 43.545 L 175.769 43.545 L 175.769 25.966 L 177.579 25.966 L 177.579 43.545 Z'
          fill='url(#chart-gradient)'
        ></path>
        <path
          d='M 154.043 66.398 L 161.285 66.398 L 161.285 90.899 L 154.043 90.899 L 154.043 108.477 L 152.232 108.477 L 152.232 90.899 L 144.99 90.899 L 144.99 66.398 L 152.232 66.398 L 152.232 48.82 L 154.043 48.82 L 154.043 66.398 Z'
          fill='url(#chart-gradient)'
        ></path>
        <path
          d='M 130.506 90.894 L 137.748 90.894 L 137.748 136.598 L 130.506 136.598 L 130.506 150.547 L 128.695 150.547 L 128.695 136.598 L 121.453 136.598 L 121.453 90.894 L 128.695 90.894 L 128.695 59.252 L 130.506 59.252 L 130.506 90.894 Z'
          fill='url(#chart-gradient)'
        ></path>
        <path
          d='M 59.895 53.981 L 67.137 53.981 L 67.137 106.717 L 50.842 106.717 L 50.842 53.981 L 58.084 53.981 L 58.084 46.95 L 59.895 46.95 L 59.895 53.981 Z'
          fill='url(#chart-gradient)'
        ></path>
        <path
          d='M 36.358 106.715 L 43.6 106.715 L 43.6 111.988 L 36.358 111.988 L 36.358 136.598 L 34.548 136.598 L 34.548 111.988 L 27.305 111.988 L 27.305 106.715 L 34.548 106.715 L 34.548 59.252 L 36.358 59.252 L 36.358 106.715 Z'
          fill='url(#chart-gradient)'
        ></path>
        <path
          d='M 293.453 55.848 L 300.695 55.848 L 300.695 75.185 L 293.453 75.185 L 293.453 119.022 L 291.643 119.022 L 291.643 75.185 L 284.4 75.185 L 284.4 55.848 L 291.643 55.848 L 291.643 50.575 L 293.453 50.575 L 293.453 55.848 Z'
          fill='url(#chart-gradient)'
        ></path>
        <path
          d='M 246.379 40.027 L 253.622 40.027 L 253.622 68.153 L 246.379 68.153 L 246.379 80.458 L 244.569 80.458 L 244.569 68.153 L 237.327 68.153 L 237.327 40.027 L 244.569 40.027 L 244.569 1.148 L 246.379 1.148 L 246.379 40.027 Z'
          fill='url(#chart-gradient)'
        ></path>
      </svg>
    </>
  );
};

const ChartData = observer(({ candles }: { candles: CandleWithVolume[] }) => {
  const chartElRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi>();
  const seriesRef = useRef<ReturnType<IChartApi['addCandlestickSeries']>>();
  const volumeSeriesRef = useRef<ReturnType<IChartApi['addHistogramSeries']>>();

  // Initialize the chart once when the component mounts
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
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
      });

      // Initialize the candlestick series
      seriesRef.current = chartRef.current.addCandlestickSeries({
        upColor: theme.color.success.light,
        downColor: theme.color.destructive.light,
        borderVisible: false,
        wickUpColor: theme.color.success.light,
        wickDownColor: theme.color.destructive.light,
      });

      // Set the price scale margins for the candlestick series
      seriesRef.current.priceScale().applyOptions({
        autoScale: true,
      });

      // Initialize the volume series
      volumeSeriesRef.current = chartRef.current.addHistogramSeries({
        color: theme.color.success.light + '80',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
        lastValueVisible: false,
        priceLineVisible: false,
      });

      // Set the price scale margins for the candlestick series
      volumeSeriesRef.current.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8, // highest point of the series will be 70% away from the top
          bottom: 0,
        },
      });

      // Update volume colors based on price movement
      volumeSeriesRef.current.setData(
        candles.map(candle => ({
          time: candle.ohlc.time,
          value: candle.volume,
          color:
            candle.ohlc.close >= candle.ohlc.open
              ? theme.color.success.light + '80'
              : theme.color.destructive.light + '80',
        })),
      );

      chartRef.current.timeScale().fitContent();
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = undefined;
      }
    };
  }, [chartElRef, candles]);

  // Update chart when candles change
  useEffect(() => {
    if (seriesRef.current && volumeSeriesRef.current) {
      // Set OHLC data
      seriesRef.current.setData(candles.map(c => c.ohlc));

      // Set volume data with colors based on price movement
      volumeSeriesRef.current.setData(
        candles.map(candle => ({
          time: candle.ohlc.time,
          value: candle.volume,
          color:
            candle.ohlc.close >= candle.ohlc.open
              ? theme.color.success.light + '80'
              : theme.color.destructive.light + '80',
        })),
      );
      chartRef.current?.timeScale().fitContent();
    }
  }, [candles]);

  // Handle window resize to re-fit content
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <div className='h-full w-full' ref={chartElRef} />;
});

export const Chart = observer(() => {
  const [duration, setDuration] = useState<DurationWindow>('1d');
  const { data, isLoading, error } = useCandles(duration);

  return (
    <div className='flex flex-col h-full min-h-0'>
      <div className='flex px-3 border-b border-b-other-solidStroke'>
        {durationWindows.map(w => (
          <button
            key={w}
            type='button'
            className={cn(
              'flex items-center px-1.5 py-3 rounded hover:text-text-primary hover:bg-other-hover transition-colors',
              w === duration ? 'text-text-primary bg-other-active' : 'text-text-secondary',
            )}
            onClick={() => setDuration(w)}
          >
            <Text detail>{w}</Text>
          </button>
        ))}
      </div>

      <div className='grow flex items-center justify-center min-h-0'>
        {error && <BlockchainError direction='column' />}
        {!error && isLoading && <ChartLoadingState />}
        {!error && !isLoading && data && <ChartData candles={data} />}
      </div>
    </div>
  );
});
