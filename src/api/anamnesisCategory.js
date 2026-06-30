// api/anamnesisCategory.js
import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// CREATE - POST /api/v1/anamnesis-categories/create
export const createAnamnesisCategory = async (data) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/anamnesis-categories/create`,
    data
  );
  return response.data;
};

// UPDATE - PUT /api/v1/anamnesis-categories/update/{id}
export const updateAnamnesisCategory = async (id, data) => {
  const response = await axiosInstance.put(
    `${API_BASE_URL}/anamnesis-categories/update/${id}`,
    data
  );
  return response.data;
};

// UPDATE STATUS - PATCH /api/v1/anamnesis-categories/update/status/{id}
export const updateAnamnesisCategoryStatus = async (id, status) => {
  const response = await axiosInstance.patch(
    `${API_BASE_URL}/anamnesis-categories/update/status/${id}`,
    { status }
  );
  return response.data;
};

// SEARCH - GET /api/v1/anamnesis-categories/search
export const searchAnamnesisCategories = async (request, pageCriteria) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/anamnesis-categories/search`,
    {
      params: {
        request: JSON.stringify(request),
        pageCriteria: JSON.stringify(pageCriteria),
      },
    }
  );
  return response.data;
};

// READ WITH PAGINATION - GET /api/v1/anamnesis-categories/read
export const readAnamnesisCategories = async (pageCriteria = { page: 0, count: 10 }) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/anamnesis-categories/read`,
    {
      params: { pageCriteria: JSON.stringify(pageCriteria) },
    }
  );
  return response.data;
};

// READ LIST - GET /api/v1/anamnesis-categories/read-list (Simple list without pagination)
export const readAnamnesisCategoriesList = async () => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/anamnesis-categories/read-list`
  );
  return response.data;
};

// READ BY ID - GET /api/v1/anamnesis-categories/read-by-id/{id}
export const readAnamnesisCategoryById = async (id) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/anamnesis-categories/read-by-id/${id}`
  );
  return response.data;
};

// EXPORT EXCEL - GET /api/v1/anamnesis-categories/export/excel
export const exportAnamnesisCategoryToExcel = async () => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/anamnesis-categories/export/excel`,
    {
      responseType: "blob",
    }
  );
  return response;
};

// DELETE - DELETE /api/v1/anamnesis-categories/delete/{id}
export const deleteAnamnesisCategory = async (id) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/anamnesis-categories/delete/${id}`
  );
  return response.data;
};
