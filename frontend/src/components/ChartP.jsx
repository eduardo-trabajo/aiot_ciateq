import React from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const ChartP = ({ data }) => {
  const chartData = {
    labels: data.map(entry => new Date(entry.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "Atmospheric Pressure",
        data: data.map(entry => entry.pressure),
        borderColor: "#AC4267",
        backgroundColor: "#AC4267",
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

export default ChartP;