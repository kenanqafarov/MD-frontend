import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "/api/v1";

export const readPatientReports = async ({
  patientId,
  operationName,
  teethNo,
  startDate,
  endDate,
  page = 0,
  size = 20,
}) => {
  const params = {
    patientId,
    operationName: operationName?.trim() || undefined,
    teethNo: teethNo || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    size,
    sort: "executionDate,desc",
  };

  const response = await axiosInstance.post(
    `${API_BASE_URL}/patient-report/read`,
    null,
    { params }
  );

  return response.data;
};
