import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// ✔ Create
export const createColor = async (data) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/color/create`,
    data
  );
  return response.data;
};

// ✔ Update
export const updateColor = async (id, data) => {
  const response = await axiosInstance.put(
    `${API_BASE_URL}/color/update/${id}`,
    data
  );
  return response.data;
};

// ✔ Update status
export const updateColorStatus = async (id, statusData) => {
  const response = await axiosInstance.patch(
    `${API_BASE_URL}/color/update/status/${id}`,
    statusData
  );
  return response.data;
};

// ✔ Search
export const searchColor = async (params) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/color/search`, {
    params,
  });
  return response.data;
};

// ✔ Read all
export const readColor = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/color/read`);
  return response.data;
};

// ✔ Read list (for dropdowns, light fetch)
export const readColorList = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/color/read-list`);
  return response.data;
};

// ✔ Read by ID
export const readColorById = async (id) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/color/read-by-id/${id}`
  );
  return response.data;
};

// ✔ Export to Excel
export const exportColorToExcel = async () => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/color/export/excel`,
    {
      responseType: "blob",
    }
  );
  return response.data;
};

// ✔ Delete
export const deleteColor = async (id) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/color/delete/${id}`
  );
  return response.data;
};
