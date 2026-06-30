import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// ✔ Create
export const createOperationItemsType = async (data) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/operation-type-items/create`,
    data
  );
  return response.data;
};

// ✔ Update
export const updateOperationItemsType = async (id, data) => {
  const response = await axiosInstance.put(
    `${API_BASE_URL}/operation-type-items/update/${id}`,
    data
  );
  return response.data;
};

// ✔ Update status
export const updateOperationItemsTypeStatus = async (id, statusData) => {
  const response = await axiosInstance.patch(
    `${API_BASE_URL}/operation-type-items/update/status/${id}`,
    statusData
  );
  return response.data;
};

// ✔ Search
export const searchOperationItemsType = async (params) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/operation-type-items/search`,
    {
      params,
    }
  );
  return response.data;
};

// ✔ Read all
export const readOperationItemsType = async (categoryId) => {
  if (!categoryId) throw new Error("Category ID is required");
  const response = await axiosInstance.get(
    `${API_BASE_URL}/operation-type-items/read/${categoryId}?page=0&count=100`
  );
  return response.data;
};
// ✔ Read by ID
export const readOperationItemsTypeById = async (id) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/operation-type-items/read-by-id/${id}`
  );
  return response.data;
};

// ✔ Export to Excel
export const exportOperationItemsTypeToExcel = async () => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/operation-type-items/export/excel`,
    {
      responseType: "blob",
    }
  );
  return response.data;
};

// ✔ Delete
export const deleteOperationItemsType = async (id) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/operation-type-items/delete/${id}`
  );
  return response.data;
};
