import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// ✔ Create
export const createBlackListResult = async (data) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/blacklist-results/create`,
    data
  );
  return response.data;
};

// ✔ Update
export const updateBlackListResult = async (id, data) => {
  const response = await axiosInstance.put(
    `${API_BASE_URL}/blacklist-results/update/${id}`,
    data
  );
  return response.data;
};

// ✔ Update status
export const updateBlackListResultStatus = async (id, statusData) => {
  const response = await axiosInstance.patch(
    `${API_BASE_URL}/blacklist-results/update/status/${id}`,
    statusData
  );
  return response.data;
};

// ✔ Search
export const searchBlackListResults = async (params) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/blacklist-results/search`,
    {
      params,
    }
  );
  return response.data;
};

// ✔ Read all
export const readBlackListResults = async () => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/blacklist-results/read`
  );
  return response.data;
};

// ✔ Read list (for dropdowns, light fetch)
export const readBlackListResultsList = async () => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/blacklist-results/read-list`
  );
  return response.data;
};

// ✔ Read by ID
export const readBlackListResultById = async (id) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/blacklist-results/read-by-id/${id}`
  );
  return response.data;
};

// ✔ Export to Excel
export const exportBlackListResultsToExcel = async () => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/blacklist-results/export/excel`,
    {
      responseType: "blob",
    }
  );
  return response.data;
};

// ✔ Delete
export const deleteBlackListResult = async (id) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/blacklist-results/delete/${id}`
  );
  return response.data;
};
