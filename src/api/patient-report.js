import axiosInstance from "./temp-axios-auth";

export const readPatientReports = async ({
  patientId,
  operationName,
  teethNo,
  startDate,
  endDate,
  page = 0,
  size = 20,
  signal,
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
    // axiosInstance already has /api/v1 as its base URL. Adding it here as
    // well produced /api/v1/api/v1/patient-report/read and made this screen
    // fail even for an authenticated user.
    "/patient-report/read",
    null,
    { params, signal }
  );

  return response.data;
};
