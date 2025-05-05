import { useEffect, useState } from "react";
import ApiClient from "@/api";
import { toast } from "sonner";
import type {
  KPIStatProps,
  RegisteredClientsProps,
  UsedDevicesProps,
} from "@/types/analytics";
import { Role } from "@/types/user";

const apiClient = new ApiClient();

export const useKpiData = (role: Role | undefined) => {
  const [kpi, setKpi] = useState<KPIStatProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const endpoint =
      role === Role.ADMIN ? "/analytics/admin-kpi" : "/analytics/user-kpi";

    apiClient.analytics.helper
      .getKpi(endpoint)
      .then((response) => {
        if (response.status) {
          if (role !== Role.ADMIN) {
            setKpi([
              {
                title: "Clients",
                value: response.data.clientsCount.value,
                change: response.data.clientsCount.change,
                changeType: response.data.clientsCount.changeType,
                trendChipPosition: "top",
                iconName: "mdi:devices",
              },
              {
                title: "Consoles",
                value: response.data.consolesCount.value,
                change: response.data.consolesCount.change,
                changeType: response.data.consolesCount.changeType,
                trendChipPosition: "top",
                iconName: "teenyicons:terminal-outline",
              },
              {
                title: "File Explorers",
                value: response.data.fileExplorersCount.value,
                change: response.data.fileExplorersCount.change,
                changeType: response.data.fileExplorersCount.changeType,
                trendChipPosition: "top",
                iconName: "solar:folder-outline",
              },
            ]);
          } else {
            setKpi([
              {
                title: "Users",
                value: response.data.usersCount.value,
                change: response.data.usersCount.change,
                changeType: response.data.usersCount.changeType,
                trendChipPosition: "top",
                iconName: "solar:users-group-rounded-linear",
              },
              {
                title: "Clients",
                value: response.data.clientsCount.value,
                change: response.data.clientsCount.change,
                changeType: response.data.clientsCount.changeType,
                trendChipPosition: "top",
                iconName: "mdi:devices",
              },
              {
                title: "Messages",
                value: response.data.messagesCount.value,
                change: response.data.messagesCount.change,
                changeType: response.data.messagesCount.changeType,
                trendChipPosition: "top",
                iconName: "mynaui:message-dots",
              },
            ]);
          }
        } else {
          toast.error("Failed to fetch user KPI");
        }
      })
      .finally(() => setIsLoading(false));
  }, [role]);

  return { kpi, isLoading };
};

export const useUsedDevices = () => {
  const [usedDevices, setUsedDevices] = useState<UsedDevicesProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient.analytics.helper
      .getUsedDevices()
      .then((response) => {
        if (response.status) {
          const data = response.data;

          setUsedDevices(data);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { usedDevices, isLoading };
};

export const useRegisteredClients = () => {
  const [registeredClients, setRegisteredClients] = useState<
    RegisteredClientsProps[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient.analytics.helper
      .getRegisteredClients()
      .then((response) => {
        if (response.status) {
          const data = response.data;

          setRegisteredClients(data);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { registeredClients, isLoading };
};
