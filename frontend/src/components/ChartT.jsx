import React from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const ChartT = ({ data }) => {
  const chartData = {
    labels: data.map(entry => new Date(entry.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "Temperature",
        data: data.map(entry => entry.temperature),
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

export default ChartT;
