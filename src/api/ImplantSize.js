import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// Create Implant Size
export const createImplantSize = async (data) => {
  try {
    console.log("Göndərilən data:", data); // Debug üçün
    const response = await axiosInstance.post(
      `${API_BASE_URL}/implant-size/create`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error creating implant size:",
      error.response?.data || error
    );
    throw error;
  }
};

// Qalan funksiyalar eyni qalır
// Read Implant Sizes
export const readImplantSizes = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/implant-size/read`);
  return response.data;
};

// Update Implant Size
export const updateImplantSize = async (data) => {
  const response = await axiosInstance.put(
    `${API_BASE_URL}/implant-size/update`,
    data
  );
  return response.data;
};

// Update Implant Size Status
export const updateImplantSizeStatus = async (data) => {
  const response = await axiosInstance.put(
    `${API_BASE_URL}/implant-size/status-updated`,
    data
  );
  return response.data;
};

// Search Implant Sizes
export const searchImplantSizes = async (data) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/implant-size/search`,
    data
  );
  return response.data;
};

// Search Implant Sizes by Status
export const searchImplantSizesByStatus = async (data) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/implant-size/search-status`,
    data
  );
  return response.data;
};

// Delete Implant Size
export const deleteImplantSize = async (id) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/implant-size/delete/${id}`
  );
  return response.data;
};