// src/components/charts/ohlcChart.tsx

import React, { useEffect, useState } from "react";
import { VStack, Text } from "@chakra-ui/react";
import { Token } from "@/utils/types/token";
import { LoadingSpinner } from "../util/loadingSpinner";
import ReactECharts from "echarts-for-react";
import { format } from "date-fns";
import { set } from "lodash";

interface OHLCChartProps {
  asset1Token: Token;
  asset2Token: Token;
}
const OHLCChart = ({ asset1Token, asset2Token }: OHLCChartProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isOHLCDataLoading, setIsOHLCDataLoading] = useState(true);
  const [isTimestampsLoading, setIsTimestampsLoading] = useState(true);
  const [ohlcData, setOHLCData] = useState([]); // [{open, high, low, close, directVolume, swapVolume, height}]
  const [blockToTimestamp, setBlockToTimestamp] = useState({}); // {height: timestamp}
  const [error, setError] = useState<string | undefined>(undefined); // [error message]
  const [chartData, setChartData] = useState<
    [string, number, number, number, number][]
  >([]); // [[date, open, close, low, high]]
  const [volumeData, setVolumeData] = useState<[string, number][]>([]);

  // TODO: Decide how to set the start block and limit
  const startBlock = 0;
  const limit = 10000;

  useEffect(() => {
    if (!asset1Token || !asset2Token) {
      return;
    }

    // Get data from the API

    // 1. First fetch ohlc data
    const ohlcData = fetch(
      `/api/ohlc/${asset1Token.display}/${asset2Token.display}/${startBlock}/${limit}`
    ).then((res) => res.json());

    Promise.all([ohlcData])
      .then(([ohlcDataResponse]) => {
        if (!ohlcDataResponse || ohlcDataResponse.error) {
          throw new Error("Error fetching data");
        }
        console.log("ohlcData", ohlcDataResponse);

        if (ohlcDataResponse.length === 0) {
          setError("No OHLC data found");
        }

        setOHLCData(ohlcDataResponse);
        setIsOHLCDataLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data", error);
        setError("Error fetching OHLC data");
        setIsLoading(false);
        setIsOHLCDataLoading(false);
      });

    // 2. Then fetch timestamp data
  }, [asset1Token, asset2Token]);

  useEffect(() => {
    if (
      !ohlcData ||
      ohlcData.length === 0 ||
      (isOHLCDataLoading && error === undefined) ||
      !isTimestampsLoading
    ) {
      return;
    }

    // Process the data and make a list of OHLC heights
    // format needed is '/api/blockTimestamps/{height1}/{height2}/{height3}'
    const timestampsForHeights = fetch(
      `/api/blockTimestamps/${ohlcData.map((ohlc) => ohlc["height"]).join("/")}`
    ).then((res) => res.json());

    Promise.all([timestampsForHeights])
      .then(([timestampsForHeightsResponse]) => {
        if (
          !timestampsForHeightsResponse ||
          timestampsForHeightsResponse.error
        ) {
          throw new Error(
            `Error fetching data: ${timestampsForHeightsResponse}`
          );
        }

        // If we have less timestamps than heights, we need to throw an error
        if (
          Object.keys(timestampsForHeightsResponse).length < ohlcData.length
        ) {
          throw new Error(
            `Error fetching data: ${timestampsForHeightsResponse}`
          );
        }

        console.log("Timestamps: ", timestampsForHeightsResponse);

        // Convert to a dictionary with height as key and timestamp as value
        const timestampMapping: { [key: string]: string } = {};
        timestampsForHeightsResponse.forEach(
          (item: { height: string; created_at: string }) => {
            timestampMapping[item.height] = item.created_at;
          }
        );
        console.log("Timestamp mapping: ", timestampMapping);

        setBlockToTimestamp(timestampMapping);
        setIsTimestampsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data", error);
        setError("Error fetching timestamps for heights: " + error);
        setIsLoading(false);
        setIsTimestampsLoading(false);
      });
  }, [ohlcData, isOHLCDataLoading]);

  useEffect(() => {
    if (isOHLCDataLoading || isTimestampsLoading) {
      return;
    }

    // Validate and format date
    const formatTimestamp = (timestamp: string) => {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? null : format(date, "yyyy-MM-dd HH:mm:ss");
    };

    // Prepare data for the chart
    // blockToTimestamp is a dictionary with height as key and timestamp as value
    const preparedData = ohlcData
      .map((ohlc) => {
        const formattedDate = formatTimestamp(blockToTimestamp[ohlc["height"]]);
        if (!formattedDate) {
          console.error(
            `Invalid timestamp for height ${ohlc["height"]}: ${
              blockToTimestamp[ohlc["height"]]
            }`
          );
          return null;
        }
        return [
          formattedDate,
          (ohlc["open"] as number).toFixed(6),
          (ohlc["close"] as number).toFixed(6),
          (ohlc["low"] as number).toFixed(6),
          (ohlc["high"] as number).toFixed(6),
          // Volume
          (ohlc["swapVolume"] as number).toFixed(2),
        ];
      })
      .filter((item) => item !== null) as [
      string,
      number,
      number,
      number,
      number,
      number
    ][];

    console.log("Prepared data: ", preparedData);

    // Divide volume by decimals of the quote token depending on the direction of the canldestick data
    const volumePreparedData = preparedData.map((item) => [
      item[0],
      item[5] / 10 ** asset2Token.decimals,
    ]) as [string, number][];

    setChartData(
      preparedData.map((item) => [item[0], item[1], item[2], item[3], item[4]])
    );
    setVolumeData(volumePreparedData);

    setIsLoading(false);
  }, [ohlcData, blockToTimestamp, isOHLCDataLoading, isTimestampsLoading]);

  const options = {
    xAxis: [
      {
        type: "category",
        data: chartData.map((item) => item[0]),
        scale: true,
        boundaryGap: true,
        axisLine: { onZero: false },
        splitLine: { show: false },
        splitNumber: 20,
        axisLabel: { show: false },
        min: "dataMin",
        max: "dataMax",
      },
      {
        type: "category",
        gridIndex: 1,
        data: volumeData.map((item) => item[0]),
        axisLine: { onZero: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          formatter: function (value: string) {
            return value.replace(/ /g, "\n"); // Replace space with a newline
          },
        },
        min: "dataMin",
        max: "dataMax",
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
        left: "10%",
        right: "8%",
        height: "60%",
      },
      {
        left: "10%",
        right: "8%",
        top: "74%",
        height: "12%",
      },
    ],
    series: [
      {
        name: "OHLC",
        type: "candlestick",
        data: chartData.map((item) => [item[1], item[2], item[3], item[4]]),
        itemStyle: {
          color: "rgba(51, 255, 87, 1)", // Neon Green
          color0: "rgba(255, 73, 108, 1)", // Neon Red
          borderColor: "rgba(51, 255, 87, 1)", // Neon Green
          borderColor0: "rgba(255, 73, 108, 1)", // Neon Red
        },
      },
      {
        name: "Volume",
        type: "bar",
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: volumeData.map((item) => item[1]),
        itemStyle: {
          color: (params: any) => {
            const ohlc = chartData[params.dataIndex];
            return ohlc[1] > ohlc[2]
              ? "rgba(255, 73, 108, 1)"
              : "rgba(51, 255, 87, 1)";
          },
        },
      },
    ],
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
      formatter: (params: any) => {
        let tooltipText = "";
        params.forEach((param: any) => {
          if (param.seriesType === "candlestick") {
            const [date, open, close, low, high] = param.data;
            tooltipText += `
            <strong>${params[0].name}</strong><br/>
            <strong>Open:</strong> ${open}<br/>
            <strong>Close:</strong> ${close}<br/>
            <strong>Low:</strong> ${low}<br/>
            <strong>High:</strong> ${high}<br/>
          `;
          } else if (
            param.seriesType === "bar" &&
            param.seriesName === "Volume"
          ) {
            tooltipText += `<strong>${params[0].name}</strong><br/>
            <strong>Volume:</strong> ${param.data}<br/>`;
          }
        });
        return tooltipText;
      },
    },
    dataZoom: [
      {
        type: "inside",
        xAxisIndex: [0, 1],
        start: 0,
        end: 100,
      },
      {
        type: "slider",
        xAxisIndex: [0, 1],
        start: 0,
        end: 100,
        backgroundColor: "rgba(0, 0, 0, 0)", // Transparent background
        showDataShadow: true, //  show data shadow
        showDetail: true, //  show detailed information
        dataBackground: {
          areaStyle: {
            color: "rgba(255, 255, 255, 0.1)", // Light grey background
          },
          lineStyle: {
            color: "rgba(255, 255, 255, 0.3)", // Light grey line
          },
        },
        fillerColor: "rgba(255, 255, 255, 0.2)", // Slightly brighter fill color
        borderColor: "rgba(255, 255, 255, 0.2)", // Light grey border
        //handleIcon:"M8.2,13.4c0,0.6-0.4,1-1,1H1.8c-0.6,0-1-0.4-1-1v-6.8c0-0.6,0.4-1,1-1h5.4c0.6,0,1,0.4,1,1V13.4z", // Handle icon
        handleSize: "100%", // Size of the handle
        handleStyle: {
          color: "rgba(255, 255, 255, 0.6)", // Light grey handle
          borderColor: "rgba(0, 0, 0, 0.5)", // Slightly darker border
        },
        textStyle: {
          color: "rgba(255, 255, 255, 0.6)", // Light grey text
        },
      },
    ],
  };

  // ! Width should be the same as that of the DepthChart

  return (
    <VStack height="600px" width={"60em"}>
      {isLoading && error === undefined ? (
        <LoadingSpinner />
      ) : error !== undefined ? (
        <VStack
          height="600px"
          width={"60em"}
          justifyContent="center"
          alignItems="center"
        >
          <Text>{`${error}`}</Text>
        </VStack>
      ) : (
        <ReactECharts
          option={options}
          style={{ height: "600px", width: "100%" }}
        />
      )}
    </VStack>
  );
};

export default OHLCChart;
