import { FC } from "react";
import type { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import { UsedDevicesProps } from "@/types/analytics";

interface UsedDevicesListProps {
  data: UsedDevicesProps[];
}

const UsedDevices: FC<UsedDevicesListProps> = ({ data }) => {
  const chartOptions: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "inherit",
    },
    colors: ["#5750F1", "#5475E5", "#8099EC", "#ADBCF2"],
    labels: data.map((item) => item.name),
    legend: {
      show: true,
      position: "bottom",
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
      formatter: (legendName, opts) => {
        const { seriesPercent } = opts.w.globals;
        return `${legendName}: ${Math.floor(seriesPercent[opts.seriesIndex])}%`;
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "80%",
          background: "transparent",
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: "Total Clients",
              fontSize: "16px",
              fontWeight: "400",
            },
            value: {
              show: true,
              fontSize: "28px",
              fontWeight: "bold",
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 2600,
        options: {
          chart: {
            width: 415,
          },
        },
      },
      {
        breakpoint: 640,
        options: {
          chart: {
            width: "100%",
          },
        },
      },
      {
        breakpoint: 370,
        options: {
          chart: {
            width: 260,
          },
        },
      },
    ],
  };

  return (
    <div className="rounded-[10px] bg-white p-2 shadow-xl h-full min-h-[400px] flex flex-col">
      <h2 className="text-body-2xlg font-bold text-dark p-3">Used Devices</h2>
      <div className="flex justify-center items-center flex-grow">
        <ReactApexChart
          options={chartOptions}
          series={data.map((item) => item.amount)}
          type="donut"
        />
      </div>
    </div>
  );
};

export default UsedDevices;
