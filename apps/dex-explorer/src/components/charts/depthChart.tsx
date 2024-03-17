import React from "react";
import { Chart as ChartJS, ChartOptions, registerables } from "chart.js";
import { Line } from "react-chartjs-2";
import annotationPlugin from "chartjs-plugin-annotation";

// Register the necessary components from chart.js
ChartJS.register(...registerables, annotationPlugin);

interface DepthChartProps {
  buySideData: { x: number; y: number }[];
  sellSideData: { x: number; y: number }[];
}

const DepthChart = ({ buySideData, sellSideData }: DepthChartProps) => {
  // Mid point is the middle of the price between the lowest sell and highest buy
  const midMarketPrice = (sellSideData[0].x + buySideData[0].x) / 2;

  console.log(buySideData, sellSideData, midMarketPrice)
  const data = {
    datasets: [
      {
        label: "Sell",
        data: sellSideData.map((point) => ({ x: point.x.toFixed(6), y: point.y.toFixed(6) })),
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
  console.log(data)

  const options: ChartOptions<"line"> = {
    scales: {
      x: {
        title: {
          display: true,
          text: "Price",
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
            return Number(val).toFixed(6);
          },
        },
      },
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      tooltip: {
        enabled: true,
        callbacks: {
          // Customize tooltip labels to show precise values
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(6); // Adjust for y value
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
    <div style={{ height: "500px", width: "50em" }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default DepthChart;
