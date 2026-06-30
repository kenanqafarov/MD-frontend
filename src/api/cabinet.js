import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// Create cabinet
export const createCabinet = async (data) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/cabinet/create`,
    data
  );
  return response.data;
};

// Update cabinet
export const updateCabinet = async (data) => {
  const response = await axiosInstance.put(
    `${API_BASE_URL}/cabinet/update`,
    data
  );
  return response.data;
};

// Update cabinet status
export const updateCabinetStatus = async (data) => {
  const response = await axiosInstance.put(
    `${API_BASE_URL}/cabinet/status-updated`,
    data
  );
  return response.data;
};

// Search cabinets
export const searchCabinets = async (searchParams) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/cabinet/search`,
    searchParams
  );
  return response.data;
};

// Read cabinets
export const getAllCabinets = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/cabinet/read`);
  return response.data;
};

// Delete cabinet by ID
export const deleteCabinetById = async (id) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/cabinet/delete/${id}`
  );
  return response.data;
};
