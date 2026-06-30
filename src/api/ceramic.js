import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// ✔ Create
export const createCeramics = async (data) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/ceramic/create`,
    data
  );
  return response.data;
};

// ✔ Update
export const updateCeramics = async (id, data) => {
  const response = await axiosInstance.put(
    `${API_BASE_URL}/ceramic/update/${id}`,
    data
  );
  return response.data;
};

// ✔ Update status
export const updateCeramicsStatus = async (id, statusData) => {
  if (!id) {
    throw new Error("ID göndərilməyib");
  }
  const response = await axiosInstance.patch(
    `${API_BASE_URL}/ceramic/update/status/${id}`,
    statusData
  );
  return response.data;
};
// ✔ Search
export const searchCeramics = async (params) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/ceramic/search`, {
    params,
  });
  return response.data;
};

// ✔ Read all
export const readCeramics = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/ceramic/read`);
  return response.data;
};

// ✔ Read list (for dropdowns, light fetch)
export const readCeramicsList = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/ceramic/read-list`);
  return response.data;
};

// ✔ Read by ID
export const readCeramicsById = async (id) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/ceramic/read-by-id/${id}`
  );
  return response.data;
};

// ✔ Export to Excel
export const exportCeramicsToExcel = async () => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/ceramic/export/excel`,
    {
      responseType: "blob",
    }
  );
  return response.data;
};

// ✔ Delete
export const deleteCeramics = async (id) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/ceramic/delete/${id}`
  );
  return response.data;
};
