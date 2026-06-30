import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

export const createTooth = async (data) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/teeth/create`,
    data
  );
  return response.data;
};

export const searchTeeth = async (criteria) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/teeth/search`,
    criteria
  );
  return response.data;
};

export const updateTooth = async (data) => {
  const response = await axiosInstance.put(
    `${API_BASE_URL}/teeth/update`,
    data
  );
  return response.data;
};

export const readAllTeeth = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/teeth/read`);
  return response.data;
};

export const readByToothNo = async (toothNo) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/teeth/read-all-by-tooth-no/${toothNo}`
  );
  return response.data;
};

export const deleteTooth = async (id) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/teeth/delete/${id}`
  );
  return response.data;
};
