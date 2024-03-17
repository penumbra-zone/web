import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface DepthChartProps {
  buySideData: {
    x: number;
    y: number;
  }[];
  sellSideData: {
    x: number;
    y: number;
  }[];
}

const DepthChart = ({ buySideData, sellSideData }: DepthChartProps) => {
  console.log("chartData", buySideData, sellSideData);

  const data = {
    labels: sellSideData
      .map((point) => point.x.toFixed(2))
      .concat(buySideData.map((point) => point.x.toFixed(2))),
    datasets: [
      {
        label: "Sell Side",
        data: sellSideData
          .map((point) => point.y)
          .concat(new Array(buySideData.length).fill(null)),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Buy Side",
        data: new Array(sellSideData.length)
          .fill(null)
          .concat(buySideData.map((point) => point.y)),
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
  };

  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: "Price",
        },
      },
      y: {
        title: {
          display: true,
          text: "Liquidity",
        },
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: true,
      },
    },
    elements: {
      line: {
        tension: 0.3, // Reduces the curve of the line
      },
      point: {
        radius: 0, // Reduces the size of the point marker
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ height: "300px", width: "600px" }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default DepthChart;
