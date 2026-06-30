import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// Create Garniture
export const createGarniture = async (data) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/garnitures/create`,
    data
  );
  return response.data;
};

// Update Garniture
export const updateGarniture = async (id, data) => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/garnitures/update/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Garniture yenilənərkən xəta baş verdi:", error);
    throw error;
  }
};

// Update Garniture Status
export const updateGarnitureStatus = async (id, statusData) => {
  const response = await axiosInstance.patch(
    `${API_BASE_URL}/garnitures/update/status/${id}`,
    statusData
  );
  return response.data;
};

// Search Garnitures
export const searchGarnitures = async (searchParams) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/garnitures/search`,
    { params: searchParams }
  );
  return response.data;
};

// Read all Garnitures
export const getAllGarnitures = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/garnitures/read`);
  return response.data;
};

// Read Garniture List
export const getGarnitureList = async () => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/garnitures/read-list`
  );
  return response.data;
};

// Read Garniture by ID
export const getGarnitureById = async (id) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/garnitures/read-by-id/${id}`
  );
  return response.data;
};

// Export Garnitures to Excel
export const exportGarnituresToExcel = async () => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/garnitures/export/excel`,
    { responseType: "blob" } // Excel faylı üçün
  );
  return response;
};

// Delete Garniture by ID
export const deleteGarnitureById = async (id) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/garnitures/delete/${id}`
  );
  return response.data;
};
