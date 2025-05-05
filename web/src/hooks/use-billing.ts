import { BillingProps, Filter } from "@/types/payment";

export function useBillingHelpers() {
  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Paid";
      case "unpaid":
        return "Open";
      case "trial":
        return "Trial";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "unpaid":
        return "warning";
      case "trial":
        return "primary";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return "solar:check-circle-broken";
      case "unpaid":
        return "solar:clock-circle-bold-duotone";
      case "trial":
        return "solar:refresh-bold";
      default:
        return "solar:info-circle-bold-duotone";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-success-100 text-success-600";
      case "unpaid":
        return "bg-warning-100 text-warning-600";
      case "trial":
        return "bg-primary-100 text-primary-600";
      default:
        return "bg-gray-100 text-red-600";
    }
  };

  const filterRecords = (records: BillingProps[], filter: Filter) => {
    return records.filter((item) => {
      if (filter === "all") return true;
      if (filter === "open") return item.status === "unpaid";
      return item.status === filter;
    });
  };

  const getPaginationData = (
    records: BillingProps[],
    currentPage: number,
    recordsPerPage: number
  ) => {
    const totalPages = Math.ceil(records.length / recordsPerPage);
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord);

    return {
      totalPages,
      indexOfFirstRecord,
      indexOfLastRecord,
      currentRecords,
    };
  };

  return {
    getStatusText,
    getStatusColor,
    getStatusIcon,
    getStatusBgColor,
    filterRecords,
    getPaginationData,
  };
}
