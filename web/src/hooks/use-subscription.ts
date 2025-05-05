"use client";

import { useEffect, useState } from "react";
import ApiClient from "@/api";
import type { StripeResponse } from "@/types/payment";

const apiClient = new ApiClient();

export function useSubscription() {
  const [currentSubscription, setCurrentSubscription] =
    useState<StripeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = () => {
    apiClient.payment.helper
      .getCurrentSubscription()
      .then((response) => {
        if (response.status) {
          setCurrentSubscription(response.data);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const getDaysRemaining = (endTimestamp: number) => {
    const now = new Date();
    const end = new Date(endTimestamp * 1000);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressPercentage = (
    startTimestamp: number,
    endTimestamp: number
  ) => {
    const now = new Date().getTime();
    const start = startTimestamp * 1000;
    const end = endTimestamp * 1000;
    const total = end - start;
    const elapsed = now - start;
    return Math.min(Math.max(Math.floor((elapsed / total) * 100), 0), 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "trialing":
        return "primary";
      case "past_due":
        return "warning";
      case "canceled":
        return "danger";
      default:
        return "default";
    }
  };

  return {
    currentSubscription,
    isLoading,
    getDaysRemaining,
    getProgressPercentage,
    getStatusColor,
    fetchSubscription,
  };
}
