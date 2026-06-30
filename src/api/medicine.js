import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// ✔ Create
export const createMedicine = async (data) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/medicine/create`,
    data
  );
  return response.data;
};

// ✔ Update
export const updateMedicine = async (id, data) => {
  const response = await axiosInstance.put(
    `${API_BASE_URL}/medicine/update/${id}`,
    data
  );
  return response.data;
};

// ✔ Update status
export const updateMedicineStatus = async (id, statusData) => {
  const response = await axiosInstance.patch(
    `${API_BASE_URL}/medicine/update-status/${id}`,
    statusData
  );
  return response.data;
};

// ✔ Search
export const searchMedicine = async (params) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/medicine/search`, {
    params,
  });
  return response.data;
};

// ✔ Read all
export const readMedicine = async (recipeId) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/medicine/search`, {
    params: {
      recipeId: recipeId,
    },
  });
  return response.data.data;
};

// ✔ Read by ID
export const readMedicineById = async (id) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/medicine/read-by-id`,
    {
      params: { id }, // Send ID as query parameter
    }
  );
  return response.data;
};

// ✔ Export to Excel
export const exportMedicineToExcel = async () => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/medicine/export/excel`,
    {
      responseType: "blob",
    }
  );
  return response.data;
};

// ✔ Delete
export const deleteMedicine = async (id) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/medicine/delete/${id}`
  );
  return response.data;
};
