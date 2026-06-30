// api/anamnesis-list.js
import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// CREATE - POST /api/v1/anamnesis-list/create
export const createAnamnesisItem = async (data) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/anamnesis-list/create`,
    data
  );
  return response.data;
};

// UPDATE - PUT /api/v1/anamnesis-list/update/{id}
export const updateAnamnesisItem = async (id, data) => {
  const response = await axiosInstance.put(
    `${API_BASE_URL}/anamnesis-list/update/${id}`,
    data
  );
  return response.data;
};

// UPDATE STATUS - PATCH /api/v1/anamnesis-list/update/status/{id}
export const updateAnamnesisItemStatus = async (id, status) => {
  const response = await axiosInstance.patch(
    `${API_BASE_URL}/anamnesis-list/update/status/${id}`,
    { status }
  );
  return response.data;
};

// SEARCH - GET /api/v1/anamnesis-list/search
export const searchAnamnesisItems = async (request, pageCriteria) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/anamnesis-list/search`,
    {
      params: {
        request: JSON.stringify(request),
        pageCriteria: JSON.stringify(pageCriteria),
      },
    }
  );
  return response.data;
};

// READ WITH PAGINATION - GET /api/v1/anamnesis-list/read
export const readAnamnesisItems = async (pageCriteria) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/anamnesis-list/read`,
    {
      params: { pageCriteria: JSON.stringify(pageCriteria) },
    }
  );
  return response.data;
};

// READ LIST - GET /api/v1/anamnesis-list/read-list
export const readAnamnesisListAll = async () => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/anamnesis-list/read-list`
  );
  return response.data;
};

// READ BY ID - GET /api/v1/anamnesis-list/read-by-id/{id}
export const readAnamnesisItemById = async (id) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/anamnesis-list/read-by-id/${id}`
  );
  // Ensure we return only the item data, not nested category data
  const itemData = response.data;
  // If response is nested, extract the actual item
  if (itemData && typeof itemData === 'object') {
    return {
      id: itemData.id,
      name: itemData.name || "",
      status: itemData.status || "ACTIVE",
      // Keep anamnesisCategory if it exists, but separately
      anamnesisCategory: itemData.anamnesisCategory || null,
    };
  }
  return itemData;
};

// EXPORT EXCEL - GET /api/v1/anamnesis-list/export/excel
export const exportAnamnesisItemsToExcel = async () => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/anamnesis-list/export/excel`,
    {
      responseType: "blob",
    }
  );
  return response;
};

// DELETE - DELETE /api/v1/anamnesis-list/delete/{id}
export const deleteAnamnesisItem = async (id) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/anamnesis-list/delete/${id}`
  );
  return response.data;
};
