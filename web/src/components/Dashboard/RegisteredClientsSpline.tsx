"use client";

import useIsMobile from "@/hooks/use-mobile";
import { FC } from "react";
import type { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import { RegisteredClientsProps } from "@/types/analytics";
import { format, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";

type RegisteredClientsSplineProps = {
  data: RegisteredClientsProps[];
};

const RegisteredClientsSpline: FC<RegisteredClientsSplineProps> = ({
  data,
}) => {
  const isMobile = useIsMobile();

  const monthLabel =
    data.length > 0
      ? format(parseISO(data[0].x), "MMMM yyyy", { locale: enUS })
      : format(new Date(), "MMMM yyyy", { locale: enUS });

  const options: ApexOptions = {
    legend: {
      show: false,
    },
    colors: ["#5750F1", "#0ABEF9"],
    chart: {
      height: 310,
      type: "area",
      toolbar: {
        show: false,
      },
      fontFamily: "inherit",
    },
    fill: {
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 320,
          },
        },
      },
    ],
    stroke: {
      curve: "smooth",
      width: isMobile ? 2 : 3,
    },
    grid: {
      strokeDashArray: 5,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      marker: {
        show: true,
      },
    },
    xaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
  };

  return (
    <div className="bg-white rounded-xl p-2 shadow-xl h-full min-h-[400px] flex flex-col">
      <h2 className="text-body-2xlg font-bold text-dark p-3">
        Registered Clients from {monthLabel}
      </h2>
      <ReactApexChart
        options={options}
        series={[
          {
            name: "Received",
            data: data.map((item) => item.y),
          },
        ]}
        type="area"
        height={310}
      />
    </div>
  );
};

export default RegisteredClientsSpline;
