"use client";

import KPIStat from "@/components/Dashboard/KPIStat";
import RegisteredClientsSpline from "@/components/Dashboard/RegisteredClientsSpline";
import UsedDevices from "@/components/Dashboard/UsedDevices";
import { userStore } from "@/data/userStore";
import { useKpiData, useRegisteredClients } from "@/hooks/use-analytics";
import { useUsedDevices } from "@/hooks/use-analytics";
import { Role } from "@/types/user";
import { Button, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const { user } = userStore();
  const { kpi, isLoading: isKpiData } = useKpiData(user.role);
  const { usedDevices, isLoading: isUsedDevicesLoading } = useUsedDevices();
  const { registeredClients, isLoading: isRegisteredClientsLoading } =
    useRegisteredClients();

  const router = useRouter();

  const isBlurred = user.role === Role.USER;

  return (
    <div className="flex flex-col gap-3">
      {isKpiData && isUsedDevicesLoading && isRegisteredClientsLoading ? (
        <Spinner label="Loading..." />
      ) : (
        <>
          <div className="">
            <h1 className="text-medium font-semibold">
              Stats of the last 30 Days
            </h1>
            <KPIStat data={kpi} />
          </div>
          {isBlurred ? (
            <div className="bg-white rounded-xl p-2 shadow-xl h-full min-h-[400px] flex flex-col">
              <div className="flex-1 flex flex-col justify-center items-center gap-4">
                <div className="flex items-center justify-center p-4 bg-gray-100 rounded-full">
                  <Icon
                    icon="solar:lock-password-bold"
                    className="h-8 w-8 text-gray-500"
                  />
                </div>
                <h1 className="text-xl font-semibold text-center">
                  You are not authorized to view this data
                </h1>
                <p className="text-gray-500 text-center max-w-md">
                  Upgrade your account to access detailed analytics and insights
                </p>
                <Button
                  className="mt-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  onPress={() => router.push("/pricing")}
                >
                  <Icon icon="ph:trend-up" fontSize={20} />
                  Upgrade Now
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-3 w-full mt-12">
              <div className="flex-1">
                <RegisteredClientsSpline data={registeredClients} />
              </div>
              <div>
                <UsedDevices data={usedDevices} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
