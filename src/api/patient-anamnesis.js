import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

export const createPatientAnamnesis = async (anamnesisData) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/patient-anamnesis/create`,
      anamnesisData
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error creating patient anamnesis:", error);
    throw error;
  }
};

export const updatePatientAnamnesis = async (id, anamnesisData) => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/patient-anamnesis/update/${id}`,
      anamnesisData
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error updating patient anamnesis:", error);
    throw error;
  }
};

export const getAllPatientAnamnesis = async () => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/patient-anamnesis/read`
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error reading all patient anamnesis:", error);
    throw error;
  }
};

export const getPatientAnamnesisByPatientId = async (patientId) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/patient-anamnesis/read/${patientId}`
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error reading patient anamnesis by patient ID:", error);
    throw error;
  }
};

export const deletePatientAnamnesis = async (id) => {
  try {
    const response = await axiosInstance.delete(
      `${API_BASE_URL}/patient-anamnesis/delete/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting patient anamnesis:", error);
    throw error;
  }
};