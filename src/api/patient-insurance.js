import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

export const createPatientInsurance = async (data) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/patient-insurance/create`,
    data
  );
  return response.data;
};

export const getPatientInsurance = async (patientId) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/patient-insurance/read`,
    {
      params: { patientId },
    }
  );
  return response.data;
};

export const updatePatientInsurance = async (id, data) => {
  const response = await axiosInstance.put(
    `${API_BASE_URL}/patient-insurance/update/${id}`,
    data
  );
  return response.data;
};

export const deletePatientInsurance = async (id) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/patient-insurance/delete/${id}`
  );
  return response.data;
};

export const updatePatientInsuranceStatus = async (id, patientId) => {
  const response = await axiosInstance.patch(
    `${API_BASE_URL}/patient-insurance/update-status/${id}`,
    { patientId }
  );
  return response.data;
};
