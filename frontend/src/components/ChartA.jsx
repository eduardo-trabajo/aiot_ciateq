import React from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const ChartA = ({ data }) => {
  const chartData = {
    labels: data.map(entry => new Date(entry.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "IAQ",
        data: data.map(entry => entry.iaq),
        borderColor: "#89396C",
        backgroundColor: "#89396C",
        tension: 0.3,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default ChartA;
