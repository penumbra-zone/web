import { useCallback, useRef } from 'react';
import { CandlestickData, createChart, HistogramData, IChartApi } from 'lightweight-charts';
import { theme } from '@penumbra-zone/ui/theme';

export const useChartConfig = (loadMore: VoidFunction, loadingDisabled: boolean) => {
  const chartElRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi>(undefined);
  const seriesRef = useRef<ReturnType<IChartApi['addCandlestickSeries']>>(undefined);
  const volumeSeriesRef = useRef<ReturnType<IChartApi['addHistogramSeries']>>(undefined);

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
      console.log('Node assigned:', node);

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
        // `from=10` parameter means the leftmost visible candle is the 10th candle
        if (!loadingDisabled && logicalRange?.from && logicalRange.from < 10) {
          // todo: stop too-many loads.
          // todo: stop fetching page >1 on each new block
          // todo: add throttle
          console.log('Visible time range changed:', logicalRange);
          loadMore();
        }
      });
    }
  }, []);

  const setCandlesData = (candles: CandlestickData[]) => {
    seriesRef.current?.setData(candles);
  };

  const setVolumeData = (volume: HistogramData[]) => {
    volumeSeriesRef.current?.setData(volume);
  };

  return {
    chartRef: setChartRef,
    setVolumeData,
    setCandlesData,
  };
};
