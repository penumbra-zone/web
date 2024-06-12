// src/components/charts/depthChart.tsx

import React, { useRef, useEffect, useState } from "react";
import {
  ChartEvent,
  Chart as ChartJS,
  ChartOptions,
  registerables,
} from "chart.js";
import { Line } from "react-chartjs-2";
import annotationPlugin, { AnnotationOptions } from "chartjs-plugin-annotation";
import { set, throttle } from "lodash";
import { Chart } from "chart.js/auto";
import { Button, HStack, Text, useBreakpoint, VStack } from "@chakra-ui/react";
import zoomPlugin, { zoom } from "chartjs-plugin-zoom";
import { Token } from "@/utils/types/token";

// Register the necessary components from chart.js
ChartJS.register(...registerables, annotationPlugin);

interface DepthChartProps {
  buySideData: { x: number; y: number }[];
  sellSideData: { x: number; y: number }[];
  buySideSingleHopData: { x: number; y: number }[];
  sellSideSingleHopData: { x: number; y: number }[];
  asset1Token: Token;
  asset2Token: Token;
}

const DepthChart = ({
  buySideData,
  sellSideData,
  buySideSingleHopData,
  sellSideSingleHopData,
  asset1Token,
  asset2Token,
}: DepthChartProps) => {
  useEffect(() => {
    if (typeof window !== "undefined")
      import("chartjs-plugin-zoom").then((plugin) => {
        ChartJS.register(plugin.default);
      });
  }, []);

  const [isMouseOverChart, setIsMouseOverChart] = useState(false);
  console.log(asset1Token, asset2Token);

  // Update hover line visibility based on mouse interaction
  const handleMouseOverChart = () => {
    setIsMouseOverChart(true);
  };

  const handleMouseOutChart = () => {
    setIsMouseOverChart(false);
  };

  // Mid point is the middle of the price between the lowest sell and highest buy
  let midMarketPrice = 0;

  // Look at synthetic - synthetic data first, and then synthetic - direct, and then finally direct - direct, check just synthetic, or just direct
  if (sellSideData.length > 0 && buySideData.length > 0) {
    midMarketPrice = (sellSideData[0].x + buySideData[0].x) / 2;
  } else if (sellSideData.length > 0 && buySideSingleHopData.length > 0) {
    midMarketPrice = (sellSideData[0].x + buySideSingleHopData[0].x) / 2;
  } else if (sellSideSingleHopData.length > 0 && buySideData.length > 0) {
    midMarketPrice = (sellSideSingleHopData[0].x + buySideData[0].x) / 2;
  } else if (
    sellSideSingleHopData.length > 0 &&
    buySideSingleHopData.length > 0
  ) {
    midMarketPrice =
      (sellSideSingleHopData[0].x + buySideSingleHopData[0].x) / 2;
  } else if (sellSideData.length > 0) {
    midMarketPrice = sellSideData[0].x;
  } else if (buySideData.length > 0) {
    midMarketPrice = buySideData[0].x;
  } else if (sellSideSingleHopData.length > 0) {
    midMarketPrice = sellSideSingleHopData[0].x;
  } else if (buySideSingleHopData.length > 0) {
    midMarketPrice = buySideSingleHopData[0].x;
  } else {
    midMarketPrice = 0;
    console.log("No data for this pair");
  }

  console.log("midMarketPrice", midMarketPrice);

  // Update all single hope data to have a point at the same x values as the non single hop data does so that we always can render both points on the tooltip
  // Make the duplicate point have the same y value as the last point in the single hop data, or 0 if the point before DNE, or dont change if the point is already there
  function synchronizeData(
    mainData: { x: number; y: number }[],
    singleHopData: { x: number; y: number }[]
  ) {
    // Create a map from singleHopData for quick lookup
    const singleHopMap = new Map(
      singleHopData.map((dataPoint) => [dataPoint.x, dataPoint.y])
    );

    // This will hold the modified single hop data
    const newSingleHopData: { x: number; y: number }[] = [];

    // Track the last y-value seen; default to 0 if no points have been processed
    let lastKnownY = 0;

    mainData.forEach((dataPoint, index) => {
      if (!singleHopMap.has(dataPoint.x)) {
        // If the single hop data does not have the x value, add it with the last known y value
        newSingleHopData.push({ x: dataPoint.x, y: lastKnownY });
      } else {
        // If the single hop data has the x value, add it with the y value
        newSingleHopData.push({
          x: dataPoint.x,
          y: singleHopMap.get(dataPoint.x)!,
        });
        lastKnownY = singleHopMap.get(dataPoint.x)!;
      }
    });

    return newSingleHopData;
  }

  buySideSingleHopData = synchronizeData(buySideData, buySideSingleHopData);
  sellSideSingleHopData = synchronizeData(sellSideData, sellSideSingleHopData);

  const chartRef = useRef<any>();

  // RenderedSellSide and RenderedBuySide are the data points that will be rendered on the chart
  const [renderedSellSideData, setRenderedSellSideData] = useState<
    {
      x: number;
      y: number;
    }[]
  >(sellSideData);
  const [renderedBuySideSingleHopData, setRenderedBuySideSingleHopData] =
    useState<{ x: number; y: number }[]>(buySideSingleHopData);

  const [renderedBuySideData, setRenderedBuySideData] = useState<
    {
      x: number;
      y: number;
    }[]
  >(buySideData);
  const [renderedSellSideSingleHopData, setRenderedSellSideSingleHopData] =
    useState<{ x: number; y: number }[]>(sellSideSingleHopData);

  const zoomLevels = [1, 1.2, 1.4, 2, 4, 8]; // Your zoom levels

  // Zoom level state, starting at 0 (100%)
  const [zoomIndex, setZoomIndex] = useState(0);
  const [lastZoomIndex, setLastZoomIndex] = useState(0);

  // Function to update the chart's view to the current zoom level
  const updateZoomRange = () => {
    const chartInstance = chartRef.current;
    if (!chartInstance) return;

    const midMarketPrice =
      (Math.min(...buySideData.map((d) => d.x)) +
        Math.max(...sellSideData.map((d) => d.x))) /
      2;
    const halfRange =
      (Math.max(...sellSideData.map((d) => d.x)) -
        Math.min(...buySideData.map((d) => d.x))) /
      2;

    const zoomFactor = zoomLevels[zoomIndex];
    const newMin = midMarketPrice - halfRange / zoomFactor;
    const newMax = midMarketPrice + halfRange / zoomFactor;

    chartInstance.options.scales.x.min = newMin;
    chartInstance.options.scales.x.max = newMax;
    chartInstance.update();
  };
  useEffect(() => {
    updateZoomRange();
  }, [zoomIndex, buySideData, sellSideData]);
  const handleZoomIn = () => {
    if (zoomIndex < zoomLevels.length - 1) {
      setZoomIndex((prevIndex) => prevIndex + 1); // Increasing index zooms out
    }
  };

  const handleZoomOut = () => {
    if (zoomIndex > 0) {
      setZoomIndex((prevIndex) => prevIndex - 1); // Decreasing index zooms in
    }
  };
  const [pageLoad, setPageLoad] = useState(false);

  const maxLiquidity = Math.max(
    ...sellSideData.map((p) => p.y),
    ...buySideData.map((p) => p.y)
  );
  const [maxY, setMaxY] = useState<number>(calculateMaxY(maxLiquidity));
  const [minXValue, setMinXValue] = useState<number>(0);
  // Max sell side value if present, otherwise max buy side value
  const [maxXValue, setMaxXValue] = useState<number>(
    sellSideData[sellSideData.length - 1]?.x || buySideData[0]?.x || 0
  );

  const xRange = maxXValue - minXValue;
  const [padding, setPadding] = useState<number>(xRange * 0.0);

  const [disablePlusButton, setDisablePlusButton] = useState(false);
  const [disableMinusButton, setDisableMinusButton] = useState(false);

  useEffect(() => {
    console.log("disable plus button", disablePlusButton);
    console.log("disable minus button", disableMinusButton);
  }, [disablePlusButton, disableMinusButton]);

  // Control the zoom level of the chart
  useEffect(() => {
    if (sellSideData.length === 0 || buySideData.length === 0) {
      setDisablePlusButton(true);
      setDisableMinusButton(true);
      return;
    }
    if (zoomIndex === lastZoomIndex && pageLoad) return;
    // Change zoom to only show points within how close they are to the midpoint price,
    // If zoom index is 1, show all points, if z oom index is 2, show middle 50% of points, if zoom index is 3, show middle 25% of points, etc.
    const localMin = 0;
    const localMax = midMarketPrice * 2;
    const range = (localMax - localMin) / zoomLevels[zoomIndex] / 2;

    const filterData = (data: { x: number; y: number }[]) => {
      // Calculate the range of prices to show based on the zoom level

      // Filter the data points to only show those within the range
      const filteredData = data.filter(
        (point) => Math.abs(point.x - midMarketPrice) <= range
      );

      return filteredData;
    };

    // Apply the filter function to all data sets
    const newRenderedBuySideData = filterData(buySideData);
    const newRenderedSellSideData = filterData(sellSideData);
    const newRenderedBuySideSingleHopData = filterData(buySideSingleHopData);
    const newRenderedSellSideSingleHopData = filterData(sellSideSingleHopData);
    // Stop zooming if there is no data for newRenderedBuySideData & newRenderedSellSideData and reset zoom level
    if (
      newRenderedBuySideData.length === 0 ||
      newRenderedSellSideData.length === 0
    ) {
      console.log("resetting zoom level", zoomIndex, lastZoomIndex);
      setZoomIndex(lastZoomIndex);

      if (newRenderedBuySideData.length === 0) {
        setDisablePlusButton(true);
        console.log("disable plus button", disablePlusButton);
      } else {
        setDisableMinusButton(true);
        console.log("disable minus button", disableMinusButton);
      }
      return;
    } else {
      setDisablePlusButton(false);
      setDisableMinusButton(false);
    }

    // Update the state for each data set
    setRenderedBuySideData(newRenderedBuySideData);
    setRenderedSellSideData(newRenderedSellSideData);
    setRenderedBuySideSingleHopData(newRenderedBuySideSingleHopData);
    setRenderedSellSideSingleHopData(newRenderedSellSideSingleHopData);

    const xVals = [
      ...newRenderedBuySideData.map((d) => d.x),
      ...newRenderedSellSideData.map((d) => d.x),
    ];

    console.log("zoomLevel", zoomLevels[zoomIndex]);

    // Add an additional point equal to the same value as the last point to extend the line to the border
    // first check if the data is not empty
    setRenderedBuySideData((prev) => {
      const lastPoint = prev[prev.length - 1];
      if (lastPoint) {
        return [...prev, { x: -1, y: lastPoint.y }];
      }
      return [{ x: -1, y: 0 }];
    });
    setRenderedSellSideData((prev) => {
      const lastPoint = prev[prev.length - 1];
      if (lastPoint) {
        return [...prev, { x: lastPoint.x + 1e18, y: lastPoint.y }];
      }
      return [{ x: -1, y: 0 }];
    });

    setRenderedBuySideSingleHopData((prev) => {
      const lastPoint = prev[prev.length - 1];
      if (lastPoint) {
        return [...prev, { x: -1, y: lastPoint.y }];
      }
      return [{ x: -1, y: 0 }];
    });
    setRenderedSellSideSingleHopData((prev) => {
      const lastPoint = prev[prev.length - 1];
      if (lastPoint) {
        return [...prev, { x: lastPoint.x + 1e18, y: lastPoint.y }];
      }
      return [{ x: -1, y: 0 }];
    });

    // Min and max should be set based on the midMarketPrice and range
    setMinXValue(midMarketPrice - range);
    setMaxXValue(midMarketPrice + range);
    setPadding(range * 0.0);
    //setPadding((Math.max(...xVals) - Math.min(...xVals)) * 0.05);

    const liquidityMax = Math.max(
      ...newRenderedSellSideData.map((p) => p.y),
      ...newRenderedBuySideData.map((p) => p.y)
    );
    console.log("maxY", calculateMaxY(liquidityMax));
    setMaxY(calculateMaxY(liquidityMax));

    // Update the last zoom level
    setLastZoomIndex(zoomIndex);
    console.log("running");
  }, [zoomIndex, midMarketPrice, buySideData, sellSideData, pageLoad]);

  // set initial zoom at 0 to load the chart appropriately
  useEffect(() => {
    setZoomIndex(0);
    setPageLoad(true);
  }, []);

  console.log("multi", buySideData, sellSideData, midMarketPrice);
  console.log("single", buySideSingleHopData, sellSideSingleHopData);
  const data: any = {
    datasets: [
      {
        label: "Incl Synthetic Sell",
        data: renderedSellSideData.map((point) => ({
          x: point.x.toFixed(6),
          y: point.y.toFixed(6),
        })),
        borderColor: "rgba(255, 73, 108, 0.6)", // Neon Red
        backgroundColor: "rgba(255, 73, 108, 0.6)",
        fill: "origin",
        stepped: "before",
        yAxisID: "left-y",
        clip: true,
      },
      {
        label: "Incl Synthetic Buy",
        data: renderedBuySideData
          .map((point) => ({ x: point.x.toFixed(6), y: point.y.toFixed(6) }))
          .reverse(),
        borderColor: "rgba(51, 255, 87, 0.6)", // Neon Green
        backgroundColor: "rgba(51, 255, 87, 0.6)",
        fill: "origin",
        // horizontal lines on buy side need to start at point on right and continue to the left
        stepped: "after",
        yAxisID: "right-y",
        clip: true,
      },
      // Single hops darker data
      {
        label: "Direct Sell",
        data: renderedSellSideSingleHopData.map((point) => ({
          x: point.x.toFixed(6),
          y: point.y.toFixed(6),
        })),
        borderColor: "rgba(255, 150, 130, .6)", // Neon Red
        backgroundColor: "rgba(255, 150, 130, .6)",
        fill: "origin",
        stepped: "before",
        yAxisID: "left-y",
        clip: true,
      },
      {
        label: "Direct Buy",
        data: renderedBuySideSingleHopData
          .map((point) => ({ x: point.x.toFixed(6), y: point.y.toFixed(6) }))
          .reverse(),
        borderColor: "rgba(255, 255, 87, .6)", // Neon Green
        backgroundColor: "rgba(255, 255, 87, .6)",
        fill: "origin",
        // horizontal lines on buy side need to start at point on right and continue to the left
        stepped: "after",
        yAxisID: "right-y",
        clip: true,
      },
    ],
  };

  // Set step size for x-axis based on the range of the data
  const totalTicks = 10;
  const [tickStepSize, setTickStepSize] = useState<number>(
    +(
      (Math.max(
        ...buySideData.map((d) => d.x),
        ...sellSideData.map((d) => d.x)
      ) -
        Math.min(
          ...buySideData.map((d) => d.x),
          ...sellSideData.map((d) => d.x)
        )) /
      totalTicks
    ).toPrecision(6)
  );

  function calculateMaxY(maxLiquidity: number) {
    if (maxLiquidity < 10) return 10; // If less than 10, round up to 10

    // Round to the nearest upper number, eg for 1500, round to 2000, for 2000, round to 3000, for 10345 round to 11000, for 12790, round to 13000
    let roundedNumber = Math.ceil(maxLiquidity / 1000) * 1000;

    // If under 1000, round to the nearest upper 100, eg for 500, round to 600, for 900, round to 1000
    if (roundedNumber <= 1000) {
      roundedNumber = Math.ceil(maxLiquidity / 100) * 100;
    }

    // If under 100, round to the nearest upper 10, eg for 50, round to 60, for 90, round to 100
    if (roundedNumber <= 100) {
      roundedNumber = Math.ceil(maxLiquidity / 10) * 10;
    }

    return roundedNumber;
  }

  const [hoverAnnotation, setHoverAnnotation] = useState<AnnotationOptions>({
    type: "line",
    scaleID: "x-axis-0",
    value: 0,
    borderColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1,
    yMin: 0,
    yMax: 1,
    xMin: midMarketPrice,
    xMax: midMarketPrice,
  });
  const updateHoverLine = throttle(
    (chart, xValue) => {
      // Directly access and manipulate the chart instance
      if (chart) {
        // Check if the annotation needs an update to prevent unnecessary changes
        const annotations = chart.options.plugins.annotation.annotations;
        const currentXMin = annotations.hoverLine?.xMin;

        if (currentXMin !== xValue) {
          // Prevent update if the value hasn't changed
          annotations.hoverLine = {
            ...annotations.hoverLine,
            xMin: xValue,
            xMax: xValue,
            yMin: 0,
            yMax: Math.max(
              ...sellSideData.map((p) => p.y),
              ...buySideData.map((p) => p.y)
            ),
          };
          chart.update("none"); // Update without animation
        }
      }
    },
    100,
    { leading: true, trailing: false }
  );
  function roundToNextBigNumber(number: number) {
    if (number <= 10) return 10; // For numbers less than or equal to 10, round up to 10

    // Calculate the order of magnitude of the number
    const orderOfMagnitude = Math.floor(Math.log10(number));
    const divisor = Math.pow(10, orderOfMagnitude);

    // Determine the first digit of the number
    const firstDigit = Math.floor(number / divisor);

    // Calculate the rounded up number based on the first digit
    const roundedNumber = (firstDigit + 1) * divisor;

    return roundedNumber;
  }

  const options: ChartOptions<"line"> = {
    scales: {
      x: {
        title: {
          display: true,
          text: `Price (${asset2Token.symbol})`,
          padding: { top: 10 },
        },
        grid: {
          display: true, // Display vertical grid lines
          color: "#363434", // Lighter color for vertical grid lines
        },
        type: "linear",
        position: "bottom",
        beginAtZero: false,
        min: Math.max(0, minXValue - padding), // Always >=0
        max: maxXValue + padding,
        ticks: {
          // Customize x-axis ticks to show more decimals
          callback: function (val, index) {
            // Convert the value to a number and format it
            return Number(val).toFixed(3);
          },
          stepSize: tickStepSize,
        },
      },
      "left-y": {
        type: "linear",
        grid: {
          display: false,
        },
        beginAtZero: true,
        position: "left",
        max: maxY,
      },
      "right-y": {
        type: "linear",
        grid: {
          display: false,
        },
        beginAtZero: true,
        title: {
          display: true,
          text: `${asset1Token.symbol}`,
          padding: { bottom: 10 },
        },
        position: "right",
        max: maxY,
      },
    },
    onHover: (event: ChartEvent, chartElement: any, chart: any) => {
      if (!event.native) return;

      const nativeEvent = event.native as MouseEvent;
      // Convert the mouse's pixel position to the corresponding value on the chart's x-axis.
      const mouseXValue = chart.scales.x.getValueForPixel(nativeEvent.offsetX);

      // Hide the hover line if the mouse is not over the chart
      if (!isMouseOverChart) {
        updateHoverLine(chart, null);
        return;
      }

      // Find the nearest data point to the cursor.
      let nearestXValue: number | null = null; // Initialize as null to later check if found any point.
      let minDistance = Infinity;

      chart.data.datasets.forEach(
        (dataset: { data: { x: number; y: number }[] }) => {
          dataset.data.forEach((dataPoint) => {
            const pointXValue =
              typeof dataPoint === "object" ? dataPoint.x : dataPoint;
            // Calculate the distance between the cursor and the data point.
            const distance = Math.abs(mouseXValue - pointXValue);
            // Check if this data point is closer than the previous closest one.
            if (distance < minDistance) {
              nearestXValue = pointXValue;
              minDistance = distance;
            }
          });
        }
      );

      if (nearestXValue !== null) {
        // Update the hover line position.
        updateHoverLine(chart, nearestXValue);
      }
    },
    plugins: {
      tooltip: {
        enabled: true,
        mode: "nearest",
        intersect: false,
        axis: "x",
        callbacks: {
          // Customize tooltip labels to show precise values
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(3); // Adjust for y value
            }
            if (context.parsed.x !== null) {
              label += " at " + context.parsed.x.toFixed(6); // Adjust for x value
            }
            return label;
          },
          title: function (context) {
            return `Price: ${context[0].parsed.x.toFixed(6)}`;
          },
        },
      },
      legend: {
        display: false,
      },
      annotation: {
        annotations: {
          line1: {
            type: "line",
            yMin: 0,
            yMax: Math.max(
              ...sellSideData.map((p) => p.y),
              ...buySideData.map((p) => p.y)
            ),
            xMin: midMarketPrice,
            xMax: midMarketPrice,
            borderColor: "black",
            borderWidth: 0,
            label: {
              display: true,
              content: `Mid Market Price: ${midMarketPrice.toFixed(6)}`,
              position: "end",
              backgroundColor: "#6e6eb8",
              font: {
                //family: "monospace"
              },
            },
          },
          hoverLine: hoverAnnotation,
        },
      },
    },
    elements: {
      point: {
        radius: 0, // Keep the small radius for points
      },
      line: {
        tension: 0, // Straight lines
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <>
      {/* 
        // ! Width should be the same as that of the OHLCChart
        */}
      <VStack height="600px" width={"60em"}>
        <div
          style={{ height: "100%", width: "100%" }}
          onMouseOver={handleMouseOverChart}
          onMouseOut={handleMouseOutChart}
        >
          <Line ref={chartRef} data={data} options={options} />
        </div>
        <HStack spacing={2} paddingRight="6" paddingTop="1">
          <Button
            onClick={handleZoomOut}
            colorScheme="purple"
            backgroundColor="var(--complimentary-background)"
            size={"sm"}
            isDisabled={zoomIndex == 0 || disableMinusButton == true}
          >
            -
          </Button>
          <Text fontSize="sm">{zoomLevels[zoomIndex]}x</Text>
          <Button
            onClick={handleZoomIn}
            colorScheme="purple"
            backgroundColor="var(--complimentary-background)"
            size={"sm"}
            isDisabled={
              zoomIndex == zoomLevels.length - 1 || disablePlusButton == true
            }
          >
            +
          </Button>
        </HStack>
      </VStack>
    </>
  );
};

export default DepthChart;
