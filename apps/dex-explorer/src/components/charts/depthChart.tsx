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

// Register the necessary components from chart.js
ChartJS.register(...registerables, annotationPlugin);

interface DepthChartProps {
  buySideData: { x: number; y: number }[];
  sellSideData: { x: number; y: number }[];
}

// TODO Fix midpoint line
// TODO: Add second y axis on right side
// TODO: Put units in

const DepthChart = ({ buySideData, sellSideData }: DepthChartProps) => {
  const [isMouseOverChart, setIsMouseOverChart] = useState(false);

  // Update hover line visibility based on mouse interaction
  const handleMouseOverChart = () => {
    setIsMouseOverChart(true);
  };

  const handleMouseOutChart = () => {
    setIsMouseOverChart(false);
  };

  // Mid point is the middle of the price between the lowest sell and highest buy
  const midMarketPrice = (sellSideData[0].x + buySideData[0].x) / 2;
  const chartRef = useRef<any>();

  console.log(buySideData, sellSideData, midMarketPrice);
  const data = {
    datasets: [
      {
        label: "Sell",
        data: sellSideData.map((point) => ({
          x: point.x.toFixed(6),
          y: point.y.toFixed(6),
        })),
        // Red
        borderColor: "rgba(255, 99, 132, 0.5)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        fill: "origin",
        stepped: true,
      },
      {
        label: "Buy",
        data: buySideData
          .map((point) => ({ x: point.x.toFixed(6), y: point.y.toFixed(6) }))
          .reverse(),
        // Green
        borderColor: "rgba(0, 255, 99, 0.5)",
        backgroundColor: "rgba(0, 255, 99, 0.5)",
        fill: "origin",
        stepped: true,
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

  const options: ChartOptions<"line"> = {
    scales: {
      x: {
        title: {
          display: true,
          text: "Price",
        },
        grid: {
          display: true, // Display vertical grid lines
          color: "#363434", // Lighter color for vertical grid lines
        },
        type: "linear",
        position: "bottom",
        beginAtZero: false,
        min: Math.min(
          ...buySideData.map((d) => d.x),
          ...sellSideData.map((d) => d.x)
        ), // Ensure no whitespace on the left
        max: Math.max(
          ...buySideData.map((d) => d.x),
          ...sellSideData.map((d) => d.x)
        ), // Ensure no whitespace on the right
        ticks: {
          // Customize x-axis ticks to show more decimals
          callback: function (val, index) {
            // Convert the value to a number and format it
            return Number(val).toFixed(3);
          },
          stepSize: tickStepSize,
        },
      },
      y: {
        grid: {
          display: false,
        },
        beginAtZero: true,
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
            borderWidth: 2,
            label: {
              display: true,
              content: `Mid Market Price: ${midMarketPrice.toFixed(6)}`,
              position: "start",
            },
          },
          //hoverLine: hoverAnnotation,
        },
      },
    },
    elements: {
      point: {
        radius: 1, // Keep the small radius for points
      },
      line: {
        tension: 0, // Straight lines
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div
      style={{ height: "500px", width: "50em" }}
      onMouseOver={handleMouseOverChart}
      onMouseOut={handleMouseOutChart}
    >
      <Line ref={chartRef} data={data} options={options} />
    </div>
  );
};

export default DepthChart;
