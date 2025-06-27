import { RefObject, useCallback, useRef } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';
import { theme } from '@penumbra-zone/ui/theme';
import { CandleWithVolume } from '@/shared/api/server/candles/utils';

// if `high` / `open` ratio is greater than this value, the chart will limit `high` to `open * RATIO`
const SUPER_CANDLE_RATIO = 3;

export const useChartConfig = (
  loadMore: () => Promise<void>,
  loadingDisabled: RefObject<boolean>,
) => {
  const chartElRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi>(undefined);
  const seriesRef = useRef<ReturnType<IChartApi['addCandlestickSeries']>>(undefined);
  const volumeSeriesRef = useRef<ReturnType<IChartApi['addHistogramSeries']>>(undefined);

  const setCandlesData = (candles: CandleWithVolume[] = []) => {
    seriesRef.current?.setData(
      candles.map(candle => ({
        ...candle.ohlc,
        // prevent extreme candle values from breaking the chart
        high:
          candle.ohlc.high / candle.ohlc.open > SUPER_CANDLE_RATIO
            ? candle.ohlc.open * SUPER_CANDLE_RATIO
            : candle.ohlc.high,
      })),
    );
  };

  const setVolumeData = (candles: CandleWithVolume[] = []) => {
    volumeSeriesRef.current?.setData(
      candles.map(candle => ({
        time: candle.ohlc.time,
        value: candle.volume,
        color:
          candle.ohlc.close >= candle.ohlc.open
            ? theme.color.success.light + '80'
            : theme.color.destructive.light + '80',
      })),
    );
  };

  const setChartRef = useCallback((node: HTMLDivElement | null) => {
    // unmount when node is null
    if (!node) {
      chartRef.current?.remove();
      chartRef.current = undefined;
      chartElRef.current = null;
      return;
    }

    // if the element is assigned, create the chart
    if (!chartElRef.current) {
      chartElRef.current = node;

      chartRef.current = createChart(node, {
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
          uniformDistribution: true,
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

      // subscribe to users scrolling left and right the price chart
      chartRef.current.timeScale().subscribeVisibleLogicalRangeChange(logicalRange => {
        // `from=-10` parameter means there needs to be at least 10 empty candles in the left of the chart
        if (!loadingDisabled.current && logicalRange?.from && logicalRange.from < -10) {
          void loadMore();
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dependent data is called from the function using current data
  }, []);

  return {
    chartRef: setChartRef,
    setVolumeData,
    setCandlesData,
  };
};
