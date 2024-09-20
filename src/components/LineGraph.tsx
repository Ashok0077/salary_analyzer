import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

interface LineGraphProps {
  data: {
    work_year: number;
    avgSalary: number;
  }[];
}

const LineGraph: React.FC<LineGraphProps> = ({ data }) => {
  const chartData = {
    labels: data.map((d) => d.work_year),
    datasets: [
      {
        label: "Average Salary (USD)",
        data: data.map((d) => d.avgSalary),
        borderColor: "#ffb703",
        backgroundColor: "#023047",
        fill: false,
        tension: 0.3,
        pointHoverBackgroundColor: "#fb8500",
        pointRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#023047",
          font: {
            size: 14,
            family: "sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: "#fb8500",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#023047",
        },
        grid: {
          color: "#E5E5E5",
        },
      },
      y: {
        ticks: {
          color: "#023047",
        },
        grid: {
          color: "#E5E5E5",
        },
      },
    },
  };

  return (
    <div className="max-w-full md:max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-4 md:p-6 my-8">
      <h2 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6 text-[#ffb703]">
        Average Salary by Year
      </h2>
      <div className="p-4 bg-[#f1f1f1] rounded-lg">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LineGraph;
