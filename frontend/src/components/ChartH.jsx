import React from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const ChartH = ({ data }) => {
  const chartData = {
    labels: data.map(entry => new Date(entry.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "Humidity",
        data: data.map(entry => entry.humidity),
        borderColor: "#D54D61",
        backgroundColor: "#D54D61",
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

export default ChartH;
