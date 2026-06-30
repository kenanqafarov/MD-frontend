import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// ✔ Create
export const createOperationTypes = async (data) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/operation-types/create`,
    data
  );
  return response.data;
};

// ✔ Update
export const updateOperationTypes = async (id, data) => {
  const response = await axiosInstance.put(
    `${API_BASE_URL}/operation-types/update/${id}`,
    data
  );
  return response.data;
};

// ✔ Update status
export const updateOperationTypesStatus = async (id, statusData) => {
  const response = await axiosInstance.patch(
    `${API_BASE_URL}/operation-types/update/status/${id}`,
    statusData
  );
  return response.data;
};

// ✔ Search
export const searchOperationTypes = async (params) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/operation-types/search`,
    {
      params,
    }
  );
  return response.data;
};

// ✔ Read all
export const readOperationTypes = async () => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/operation-types/read`
  );
  return response.data;
};

// ✔ Read list (for dropdowns, light fetch)
export const readOperationTypesList = async () => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/operation-types/read-list`
  );
  return response.data;
};

// ✔ Read by ID
export const readOperationTypesById = async (id) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/operation-types/read-by-id/${id}`
  );
  return response.data;
};

// ✔ Export to Excel
export const exportOperationTypesToExcel = async () => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/operation-types/export/excel`,
    {
      responseType: "blob",
    }
  );
  return response.data;
};

// ✔ Delete
export const deleteOperationTypes = async (id) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/operation-types/delete/${id}`
  );
  return response.data;
};
