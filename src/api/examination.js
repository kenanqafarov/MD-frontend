import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// Create Examination
export const createExamination = async (data) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/examination/create`,
    data
  );
  return response.data;
};

// Update Examination
export const updateExamination = async (data) => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/examination/update`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Update zamanı xəta baş verdi:", error);
    throw error;
  }
};
// Update Examination status
export const updateExaminationStatus = async (data) => {
  const response = await axiosInstance.put(
    `${API_BASE_URL}/examination/update-status`,
    data
  );
  return response.data;
};

// Search Examinations
export const searchExaminations = async (searchParams) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/examination/search`,
    searchParams
  );
  return response.data;
};

// Read Examinations
export const getAllExaminations = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/examination/read`);
  return response.data;
};

// Delete Examination by ID
export const deleteExaminationById = async (id) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/examination/delete/${id}`
  );
  return response.data;
};
