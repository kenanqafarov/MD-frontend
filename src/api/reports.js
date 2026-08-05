import axiosInstance from "./temp-axios-auth";

export const fetchDashboardReports = async ({ period, fromDate, toDate, signal }) => {
  const params = {
    period: period || "bu_ay",
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  };

  const response = await axiosInstance.get("/reports/dashboard", {
    params,
    signal,
  });

  return response.data;
};

export const fetchDetailedReports = async ({ criteria, page = 0, size = 10, signal }) => {
  const params = {
    page,
    size,
    sort: "executionDate,desc",
  };

  // POST with body for criteria and pagination as params
  const response = await axiosInstance.post("/reports/detailed", criteria || {}, {
    params,
    signal,
  });

  return response.data;
};

export const exportDetailedReports = async (criteria) => {
  const response = await axiosInstance.post("/reports/export/detailed", criteria || {}, {
    responseType: "blob",
  });
  return response.data;
};

export const exportPaymentsReports = async ({ period, fromDate, toDate }) => {
  const params = {
    period: period || "bu_ay",
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  };
  const response = await axiosInstance.get("/reports/export/payments", {
    params,
    responseType: "blob",
  });
  return response.data;
};
