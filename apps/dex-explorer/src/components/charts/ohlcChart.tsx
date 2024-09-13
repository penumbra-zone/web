// @ts-nocheck
/* eslint-disable -- disabling this file as this was created before our strict rules */
// src/components/charts/ohlcChart.tsx

import React, { useEffect, useState, useRef } from 'react';
import { VStack, Text, Button, ButtonGroup, Flex } from '@chakra-ui/react';
import useComponentSize from '@rehooks/component-size';
import { Token } from '@/utils/types/token';
import { LoadingSpinner } from '../util/loadingSpinner';
import ReactECharts from 'echarts-for-react';
import { format } from 'date-fns';

interface OHLCChartProps {
  asset1Token: Token;
  asset2Token: Token;
}
const OHLCChart = ({ asset1Token, asset2Token }: OHLCChartProps) => {
  const wrapperRef = useRef();
  const { width } = useComponentSize(wrapperRef);
  const [isLoading, setIsLoading] = useState(true);
  const [isOHLCDataLoading, setIsOHLCDataLoading] = useState(true);
  const [isTimestampsLoading, setIsTimestampsLoading] = useState(true);
  const [ohlcData, setOHLCData] = useState([]); // [{open, high, low, close, directVolume, swapVolume, height}]
  const [originalOHLCData, setOriginalOHLCData] = useState([]); // [{open, high, low, close, directVolume, swapVolume, height}
  const [blockToTimestamp, setBlockToTimestamp] = useState<Record<string, string>>({}); // {height: timestamp}
  const [error, setError] = useState<string | undefined>(undefined); // [error message]
  const [chartData, setChartData] = useState<[string, number, number, number, number][]>([]); // [[date, open, close, low, high]]
  const [volumeData, setVolumeData] = useState<[string, number][]>([]);
  // Time aggregate, 1m, 5m, 1h, 1D to start off
  const [timeAggregateSeconds, setTimeAggregateSeconds] = useState<number>(60 * 60 * 24); // 1D default
  const [isAggregating, setIsAggregating] = useState(true);

  // Potentially show last n days of data based on current block - n days via avg block time
  const blockTimeSeconds = 5; // 5s seconds
  const daysLookback = 7; // 1 week lookback
  const limit = 10000;

  useEffect(() => {
    if (!asset1Token || !asset2Token) {
      return;
    }
    // Get current block height from `/api/blocks/1`
    const getData = async () => {
      const startBlock = await fetch('/api/blocks/1')
        .then(res => res.json())
        .then(data => {
          const currentBlock = data[0].height;
          console.log(currentBlock);
          const startBlock =
            currentBlock - Math.trunc((daysLookback * 24 * 60 * 60) / blockTimeSeconds);
          console.log('Start block: ', startBlock);
          return startBlock;
        })
        .catch(error => {
          console.error('Error fetching data', error);
          setError('Error fetching block height');
          setIsLoading(false);
          return 0; // Gets recent data (not necessarily last 7 days)
        });

      // Get data from the API

      // 1. First fetch ohlc data
      const ohlcDataForward = fetch(
        `/api/ohlc/${asset1Token.display}/${asset2Token.display}/${startBlock}/${limit}`,
      ).then(res => res.json());
      const ohlcDataBackward = fetch(
        `/api/ohlc/${asset2Token.display}/${asset1Token.display}/${startBlock}/${limit}`,
      ).then(res => res.json());

      Promise.all([ohlcDataForward, ohlcDataBackward])
        .then(([ohlcDataForwardResponse, ohlcDataBackwardResponse]) => {
          if (
            !ohlcDataForwardResponse ||
            ohlcDataForwardResponse.error ||
            !ohlcDataBackwardResponse ||
            ohlcDataBackwardResponse.error
          ) {
            throw new Error('Error fetching data');
          }
          console.log('ohlcDataForward', ohlcDataForwardResponse);
          console.log('ohlcDataBackward', ohlcDataBackwardResponse);

          if (ohlcDataForwardResponse.length === 0 && ohlcDataBackwardResponse.length === 0) {
            setError('No OHLC data found');
          }

          // Merge the two arrays, forward will be left alone, however backward will need to have 1/price and volumes will have to account for the pricing and decimal difference
          ohlcDataBackwardResponse.forEach((item: any) => {
            item.open = 1 / item.open;
            item.close = 1 / item.close;
            item.high = 1 / item.high;
            item.low = 1 / item.low;
            // TODO: Adjust volumes based on price? But what price???
            item.swapVolume =
              (item.swapVolume * (1 / item.close)) /
              10 ** Math.abs(asset2Token.decimals - asset2Token.decimals);
            item.directVolume =
              (item.directVolume * (1 / item.close)) /
              10 ** Math.abs(asset1Token.decimals - asset2Token.decimals);
          });

          // If theres any data at the same height, combine them
          const combinedDataMap = new Map();
          ohlcDataForwardResponse.forEach((item: any) => {
            if (
              combinedDataMap.has(item.height) &&
              combinedDataMap.get(item.height).height === item.height
            ) {
              const combinedItem = combinedDataMap.get(item.height);
              // OHLC should be weighted average
              const totalVolume = item.swapVolume + item.directVolume;
              const oldTotalVolume = combinedItem.swapVolume + combinedItem.directVolume;

              combinedItem.open =
                (combinedItem.open * oldTotalVolume + item.open * totalVolume) /
                (oldTotalVolume + totalVolume);
              combinedItem.close =
                (combinedItem.close * oldTotalVolume + item.close * totalVolume) /
                (oldTotalVolume + totalVolume);
              combinedItem.high = Math.max(combinedItem.high, item.high);
              combinedItem.low = Math.min(combinedItem.low, item.low);

              combinedItem.directVolume += item.directVolume;
              combinedItem.swapVolume += item.swapVolume;
            } else {
              combinedDataMap.set(item.height, item);
            }
          });
          ohlcDataBackwardResponse.forEach((item: any) => {
            if (
              combinedDataMap.has(item.height) &&
              combinedDataMap.get(item.height).height === item.height
            ) {
              const combinedItem = combinedDataMap.get(item.height);
              // OHLC should be weighted average
              const totalVolume = item.swapVolume + item.directVolume;
              const oldTotalVolume = combinedItem.swapVolume + combinedItem.directVolume;

              combinedItem.open =
                (combinedItem.open * oldTotalVolume + item.open * totalVolume) /
                (oldTotalVolume + totalVolume);
              combinedItem.close =
                (combinedItem.close * oldTotalVolume + item.close * totalVolume) /
                (oldTotalVolume + totalVolume);
              combinedItem.high = Math.max(combinedItem.high, item.high);
              combinedItem.low = Math.min(combinedItem.low, item.low);

              combinedItem.directVolume += item.directVolume;
              combinedItem.swapVolume += item.swapVolume;
            } else {
              combinedDataMap.set(item.height, item);
            }
          });

          // Sort the data by height
          // Put it back into an array
          const sortedData = Array.from(combinedDataMap.values()).sort(
            (a, b) => a.height - b.height,
          );

          setOHLCData(sortedData as any);
          setOriginalOHLCData(sortedData as any);
          setIsOHLCDataLoading(false);
        })
        .catch(error => {
          console.error('Error fetching data', error);
          setError('Error fetching OHLC data');
          setIsLoading(false);
          setIsOHLCDataLoading(false);
        });
    };

    getData();

    // 2. Then fetch timestamp data
  }, [asset1Token, asset2Token]);

  useEffect(() => {
    if (
      !originalOHLCData ||
      originalOHLCData.length === 0 ||
      (isOHLCDataLoading && error === undefined) ||
      !isTimestampsLoading
    ) {
      return;
    }

    // Process the data and make a list of OHLC heights
    // format needed is '/api/blockTimestamps/range/{startHeight}/{endHeight}'
    const timestampsForHeights = fetch(
      `/api/blockTimestamps/range/${originalOHLCData[0].height}/${originalOHLCData[originalOHLCData.length - 1].height}`,
    ).then(res => res.json());

    Promise.all([timestampsForHeights])
      .then(([timestampsForHeightsResponse]) => {
        if (!timestampsForHeightsResponse || timestampsForHeightsResponse.error) {
          throw new Error(`Error fetching data: ${timestampsForHeightsResponse}`);
        }

        // If we have less timestamps than heights, we need to throw an error
        if (Object.keys(timestampsForHeightsResponse).length < originalOHLCData.length) {
          throw new Error(`Error fetching data: ${timestampsForHeightsResponse}`);
        }

        console.log('Timestamps: ', timestampsForHeightsResponse);

        // Convert to a dictionary with height as key and timestamp as value
        const timestampMapping: Record<string, string> = {};
        timestampsForHeightsResponse.forEach((item: { height: string; created_at: string }) => {
          timestampMapping[item.height] = item.created_at;
        });
        console.log('Timestamp mapping: ', timestampMapping);

        setBlockToTimestamp(timestampMapping);
        setIsTimestampsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data', error);
        setError('Error fetching timestamps for heights: ' + error);
        setIsLoading(false);
        setIsTimestampsLoading(false);
      });
  }, [originalOHLCData, isOHLCDataLoading]);

  useEffect(() => {
    if (isOHLCDataLoading || isTimestampsLoading || error !== undefined || isAggregating) {
      return;
    }

    // Validate and format date
    const formatTimestamp = (timestamp: string) => {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? null : format(date, 'yyyy-MM-dd HH:mm:ss');
    };

    // Prepare data for the chart
    // blockToTimestamp is a dictionary with height as key and timestamp as value
    const preparedData = ohlcData
      .map(ohlc => {
        const formattedDate = formatTimestamp(blockToTimestamp[ohlc.height]);
        if (!formattedDate) {
          console.error(
            `Invalid timestamp for height ${ohlc.height}: ${blockToTimestamp[ohlc.height]}`,
          );
          setError('Missing timestamp for height ' + ohlc.height);
          return null;
        }

        const decimalCorrection = 10 ** Math.abs(asset2Token.decimals - asset1Token.decimals);
        return [
          formattedDate,
          ((ohlc.open as number) / decimalCorrection).toFixed(6),
          ((ohlc.close as number) / decimalCorrection).toFixed(6),
          ((ohlc.low as number) / decimalCorrection).toFixed(6),
          ((ohlc.high as number) / decimalCorrection).toFixed(6),
          // Volume
          // Divide volume by decimals of the quote token depending on the direction of the canldestick data
          (((ohlc.swapVolume as number) + ohlc.directVolume) / 10 ** asset1Token.decimals).toFixed(
            2,
          ),
        ];
      })
      .filter(item => item !== null) as [string, number, number, number, number, number][];

    console.log('Prepared data: ', preparedData);

    const volumePreparedData = preparedData.map(item => [item[0], item[5]]);

    setChartData(preparedData.map(item => [item[0], item[1], item[2], item[3], item[4]]));
    setVolumeData(volumePreparedData);

    setIsLoading(false);
  }, [ohlcData, blockToTimestamp, isOHLCDataLoading, isTimestampsLoading, error, isAggregating]);

  // Aggregate data base on the timeAggregateSeconds
  useEffect(() => {
    if (isOHLCDataLoading || isTimestampsLoading) {
      return;
    }

    setIsLoading(true);
    setIsAggregating(true);

    const batchOHLCData = (batch: any[], intervalStart: Date) => {
      const aggregatedOHLC: any = {
        open: batch[0].open,
        high: Math.max(...batch.map(ohlc => ohlc.high)),
        low: Math.min(...batch.map(ohlc => ohlc.low)),
        close: batch[batch.length - 1].close,
        directVolume: batch.reduce((acc, ohlc) => acc + ohlc.directVolume, 0),
        swapVolume: batch.reduce((acc, ohlc) => acc + ohlc.swapVolume, 0),
        height: batch[0].height,
      };

      // Add the interval start time to blockToTimestamp
      blockToTimestamp[aggregatedOHLC.height] = intervalStart.toISOString();

      return aggregatedOHLC;
    };

    const createPlaceholderOHLC = (intervalStart: Date, close: number) => {
      const placeholderHeight = `placeholder_${intervalStart.getTime()}`;
      const placeholderOHLC = {
        open: close,
        high: close,
        low: close,
        close: close,
        directVolume: 0,
        swapVolume: 0,
        height: placeholderHeight,
      };

      // Add the interval start time to blockToTimestamp
      blockToTimestamp[placeholderHeight] = intervalStart.toISOString();

      return placeholderOHLC;
    };

    // Function to aggregate OHLC data into time intervals
    const aggregateOHLCData = () => {
      const aggregatedData: any[] = [];

      // Helper function to get the start of the interval
      const getIntervalStart = (timestamp: string) => {
        const date = new Date(timestamp);
        switch (timeAggregateSeconds) {
          case 60: // 1 minute
            date.setSeconds(0, 0);
            break;
          case 60 * 5: // 5 minutes
            date.setMinutes(Math.floor(date.getMinutes() / 5) * 5, 0, 0);
            break;
          case 60 * 60: // 1 hour
            date.setMinutes(0, 0, 0);
            break;
          case 60 * 60 * 24: // 1 day
            date.setHours(0, 0, 0, 0);
            break;
        }
        return date;
      };

      let currentBatch: any[] = [];
      let currentIntervalStart: Date | null = null;

      originalOHLCData.forEach((ohlc, index) => {
        const timestamp = new Date(blockToTimestamp[ohlc.height]);
        const intervalStart = getIntervalStart(timestamp.toISOString());

        if (currentIntervalStart === null) {
          currentIntervalStart = intervalStart;
        }

        if (timestamp < new Date(currentIntervalStart.getTime() + timeAggregateSeconds * 1000)) {
          currentBatch.push(ohlc);
        } else {
          // Aggregate the current batch
          if (currentBatch.length > 0) {
            aggregatedData.push(batchOHLCData(currentBatch, currentIntervalStart));
          }

          // Fill in any missing intervals
          while (
            new Date(currentIntervalStart.getTime() + timeAggregateSeconds * 1000) <= intervalStart
          ) {
            currentIntervalStart = new Date(
              currentIntervalStart.getTime() + timeAggregateSeconds * 1000,
            );
            if (currentIntervalStart < intervalStart) {
              const previousOHLC = aggregatedData[aggregatedData.length - 1];
              const placeholderOHLC = createPlaceholderOHLC(
                currentIntervalStart,
                previousOHLC.close,
              );
              aggregatedData.push(placeholderOHLC);
            }
          }

          // Start a new batch
          currentBatch = [ohlc];
          currentIntervalStart = intervalStart;
        }

        // Handle the last batch
        if (index === originalOHLCData.length - 1 && currentBatch.length > 0) {
          aggregatedData.push(batchOHLCData(currentBatch, currentIntervalStart));
        }
      });

      return aggregatedData;
    };

    const aggregatedData = aggregateOHLCData();
    console.log('Aggregated data: ', aggregatedData);

    // Further processing or state setting with aggregatedData
    setOHLCData(aggregatedData as any);
    setBlockToTimestamp(blockToTimestamp);
    setIsLoading(false);
    setIsAggregating(false);
  }, [timeAggregateSeconds, isOHLCDataLoading, isTimestampsLoading, blockToTimestamp, error]);

  const options = {
    width: width - 44 - 8,
    xAxis: [
      {
        type: 'category',
        data: chartData.map(item => item[0]),
        scale: true,
        boundaryGap: true,
        axisLine: { onZero: false },
        splitLine: { show: false },
        splitNumber: 20,
        axisLabel: { show: false },
        min: 'dataMin',
        max: 'dataMax',
      },
      {
        type: 'category',
        gridIndex: 1,
        data: volumeData.map(item => item[0]),
        axisLine: { onZero: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          formatter: function (value: string) {
            return value.replace(/ /g, '\n'); // Replace space with a newline
          },
        },
        min: 'dataMin',
        max: 'dataMax',
      },
    ],
    yAxis: [
      {
        scale: true,
      },
      {
        scale: true,
        gridIndex: 1,
        splitNumber: 2,
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
      },
    ],
    grid: [
      {
        left: 44,
        right: 8,
        height: '60%',
      },
      {
        left: 44,
        right: 8,
        top: '74%',
        height: '12%',
      },
    ],
    series: [
      {
        name: 'OHLC',
        type: 'candlestick',
        data: chartData.map(item => [item[1], item[2], item[3], item[4]]),
        itemStyle: {
          color: 'rgba(51, 255, 87, 1)', // Neon Green
          color0: 'rgba(255, 73, 108, 1)', // Neon Red
          borderColor: 'rgba(51, 255, 87, 1)', // Neon Green
          borderColor0: 'rgba(255, 73, 108, 1)', // Neon Red
        },
      },
      {
        name: 'Volume',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: volumeData.map(item => item[1]),
        itemStyle: {
          color: (params: any) => {
            const ohlc = chartData[params.dataIndex];
            return ohlc[1] > ohlc[2] ? 'rgba(255, 73, 108, 1)' : 'rgba(51, 255, 87, 1)';
          },
        },
      },
    ],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
      formatter: (params: any) => {
        let tooltipText = '';
        params.forEach((param: any) => {
          if (param.seriesType === 'candlestick') {
            const [date, open, close, low, high] = param.data;
            tooltipText += `
            <strong>${params[0].name}</strong><br/>
            <strong>Open:</strong> ${Number(open).toLocaleString()}<br/>
            <strong>Close:</strong> ${Number(close).toLocaleString()}<br/>
            <strong>Low:</strong> ${Number(low).toLocaleString()}<br/>
            <strong>High:</strong> ${Number(high).toLocaleString()}<br/>
          `;
          } else if (param.seriesType === 'bar' && param.seriesName === 'Volume') {
            tooltipText += `<strong>${params[0].name}</strong><br/>
            <strong>Volume:</strong> ${Number(param.data).toLocaleString()}<br/>`;
          }
        });
        return tooltipText;
      },
    },
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0, 1],
        start: 0,
        end: 100,
      },
      {
        type: 'slider',
        xAxisIndex: [0, 1],
        start: 0,
        end: 100,
        backgroundColor: 'rgba(0, 0, 0, 0)', // Transparent background
        showDataShadow: true, //  show data shadow
        showDetail: true, //  show detailed information
        dataBackground: {
          areaStyle: {
            color: 'rgba(255, 255, 255, 0.1)', // Light grey background
          },
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.3)', // Light grey line
          },
        },
        fillerColor: 'rgba(255, 255, 255, 0.2)', // Slightly brighter fill color
        borderColor: 'rgba(255, 255, 255, 0.2)', // Light grey border
        // handleIcon:"M8.2,13.4c0,0.6-0.4,1-1,1H1.8c-0.6,0-1-0.4-1-1v-6.8c0-0.6,0.4-1,1-1h5.4c0.6,0,1,0.4,1,1V13.4z", // Handle icon
        handleSize: '100%', // Size of the handle
        handleStyle: {
          color: 'rgba(255, 255, 255, 0.6)', // Light grey handle
          borderColor: 'rgba(0, 0, 0, 0.5)', // Slightly darker border
        },
        textStyle: {
          color: 'rgba(255, 255, 255, 0.6)', // Light grey text
        },
      },
    ],
  };

  return (
    <VStack ref={wrapperRef} width='100%' position='relative'>
      {isLoading && error === undefined ? (
        <LoadingSpinner />
      ) : error !== undefined ? (
        <VStack height='400px' width={'100%'} justifyContent='center' alignItems='center'>
          <Text>{error}</Text>
        </VStack>
      ) : (
        <>
          <Flex width='100%' justifyContent='flex-start'>
            <ButtonGroup
              size='xs'
              isAttached
              borderRadius={10}
              outline={'2px solid var(--complimentary-background)'}
            >
              <Button
                borderRadius={10}
                onClick={() => setTimeAggregateSeconds(60)}
                colorScheme={
                  timeAggregateSeconds === 60 ? 'purple' : 'var(--charcoal-tertiary-blended)'
                }
              >
                1m
              </Button>
              <Button
                borderRadius={10}
                onClick={() => setTimeAggregateSeconds(60 * 5)}
                colorScheme={
                  timeAggregateSeconds === 60 * 5 ? 'purple' : 'var(--charcoal-tertiary-blended)'
                }
              >
                5m
              </Button>
              <Button
                borderRadius={10}
                onClick={() => setTimeAggregateSeconds(60 * 60)}
                colorScheme={
                  timeAggregateSeconds === 60 * 60 ? 'purple' : 'var(--charcoal-tertiary-blended)'
                }
              >
                1h
              </Button>
              <Button
                borderRadius={10}
                onClick={() => setTimeAggregateSeconds(60 * 60 * 24)}
                colorScheme={
                  timeAggregateSeconds === 60 * 60 * 24
                    ? 'purple'
                    : 'var(--charcoal-tertiary-blended)'
                }
              >
                1d
              </Button>
            </ButtonGroup>
          </Flex>
          <ReactECharts option={options} style={{ height: '400px', width: '100%' }} />
        </>
      )}
    </VStack>
  );
};

export default OHLCChart;
