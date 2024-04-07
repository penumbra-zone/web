import React, { useRef, useEffect, useState } from "react";
import {
  ChartEvent,
  Chart as ChartJS,
  ChartOptions,
  registerables,
} from "chart.js";
import { Line } from "react-chartjs-2";
import annotationPlugin, { AnnotationOptions } from "chartjs-plugin-annotation";
import { throttle } from "lodash";
import { Chart } from "chart.js/auto";
import { Text, VStack } from "@chakra-ui/react";
import { Token } from "@/constants/tokenConstants";
import zoomPlugin from "chartjs-plugin-zoom";

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

  // TODO these wont work if theres no data
  // Mid point is the middle of the price between the lowest sell and highest buy
  let midMarketPrice = 0;

  if (sellSideData.length > 0 && buySideData.length > 0) {
    midMarketPrice = (sellSideData[0].x + buySideData[0].x) / 2;
  } else if (sellSideSingleHopData.length > 0) {
    midMarketPrice = sellSideSingleHopData[0].x;
  } else {
    midMarketPrice = buySideSingleHopData[0].x;
  }

  const chartRef = useRef<any>();

  // Add an extra data point at the end of the buy dataset
  // Set default value if data is empty
  if (buySideData.length === 0) {
    buySideData = [{ x: 0, y: 0 }];
  }

  const lastBuyPoint = buySideData[buySideData.length - 1];
  const extendedBuySideData = [
    ...buySideData,
    {
      x: lastBuyPoint.x + (lastBuyPoint.x - buySideData[0].x),
      y: lastBuyPoint.y,
    },
  ];

  // Add an extra data point at the end of the sell dataset
  // Set default value if data is empty
  if (sellSideData.length === 0) {
    sellSideData = [{ x: 0, y: 0 }];
  }

  const lastSellPoint = sellSideData[sellSideData.length - 1];
  const extendedSellSideData = [
    ...sellSideData,
    {
      x: lastSellPoint.x + (lastSellPoint.x - sellSideData[0].x),
      y: lastSellPoint.y,
    },
  ];

  // Repeat for single hop data
  // Set default value if data is empty
  if (buySideSingleHopData.length === 0) {
    buySideSingleHopData = [{ x: 0, y: 0 }];
  }
  const lastBuySingleHopPoint =
    buySideSingleHopData[buySideSingleHopData.length - 1];
  const extendedBuySideSingleHopData = [
    ...buySideSingleHopData,
    {
      x:
        lastBuySingleHopPoint.x +
        (lastBuySingleHopPoint.x - buySideSingleHopData[0].x),
      y: lastBuySingleHopPoint.y,
    },
  ];

  // Set default value if data is empty
  if (sellSideSingleHopData.length === 0) {
    sellSideSingleHopData = [{ x: 0, y: 0 }];
  }
  const lastSellSingleHopPoint =
    sellSideSingleHopData[sellSideSingleHopData.length - 1];
  const extendedSellSideSingleHopData = [
    ...sellSideSingleHopData,
    {
      x:
        lastSellSingleHopPoint.x +
        (lastSellSingleHopPoint.x - sellSideSingleHopData[0].x),
      y: lastSellSingleHopPoint.y,
    },
  ];

  console.log("multi", buySideData, sellSideData, midMarketPrice);
  console.log("single", buySideSingleHopData, sellSideSingleHopData);
  const data: any = {
    datasets: [
      {
        label: "Synthetic Sell",
        data: extendedSellSideData.map((point) => ({
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
        label: "Synthetic Buy",
        data: extendedBuySideData
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
        data: extendedSellSideSingleHopData.map((point) => ({
          x: point.x.toFixed(6),
          y: point.y.toFixed(6),
        })),
        borderColor: "rgba(255, 73, 255, .6)", // Neon Red
        backgroundColor: "rgba(255, 73, 255, .6)",
        fill: "origin",
        stepped: "before",
        yAxisID: "left-y",
        clip: true,
      },
      {
        label: "Direct Buy",
        data: extendedBuySideSingleHopData
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

  /*
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
  */

  // Set step size for x-axis based on the range of the data
  const totalTicks = 10;
  const tickStepSize: number = +(
    (Math.max(...buySideData.map((d) => d.x), ...sellSideData.map((d) => d.x)) -
      Math.min(
        ...buySideData.map((d) => d.x),
        ...sellSideData.map((d) => d.x)
      )) /
    totalTicks
  ).toPrecision(6);

  const maxLiquidity = Math.max(
    ...sellSideData.map((p) => p.y),
    ...buySideData.map((p) => p.y)
  );

  /*
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
  */

  // Round to nearest upper 10^n and then the nearest next lowest 10^n
  //const maxY = roundToNextBigNumber(maxLiquidity);
  function calculateMaxY(maxLiquidity: number) {
    if (maxLiquidity < 10) return 10; // If less than 10, round up to 10

    const maxLiquidityExponent = Math.floor(Math.log10(maxLiquidity));
    const magnitude = 10 ** maxLiquidityExponent;
    const significantFigure = Math.floor(maxLiquidity / magnitude);
    const nextSignificantFigure = significantFigure + 1;
    const maxY = nextSignificantFigure * magnitude;

    // If the significant figure is a 1, it means we're closer to the lower end of the magnitude.
    // We should round to the halfway point instead of the next magnitude.
    return significantFigure === 1 ? 1.5 * magnitude : maxY;
  }

  const maxY = calculateMaxY(maxLiquidity);
  const xValues = [
    ...buySideData.map((d) => d.x),
    ...sellSideData.map((d) => d.x),
  ];
  const minXValue = Math.min(...xValues);
  const maxXValue = Math.max(...xValues);
  const xRange = maxXValue - minXValue;
  const padding = xRange * 0.05;

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
        min: minXValue - padding,
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
    // ! This line works but its not perfect
    /*
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
    */
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
            },
          },
          //hoverLine: hoverAnnotation,
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
      <VStack>
        <div
          style={{ height: "500px", width: "60em" }}
          onMouseOver={handleMouseOverChart}
          onMouseOut={handleMouseOutChart}
        >
          <Line ref={chartRef} data={data} options={options} />
        </div>
      </VStack>
    </>
  );
};

export default DepthChart;
