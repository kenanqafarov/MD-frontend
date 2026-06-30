import axiosInstance from "./temp-axios-auth";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

export const createProduct = async (productData) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/product/create`,
      productData
    );
    return response.data;
  } catch (error) {
    console.error("Xəta:", error.response?.data || error.message);
    throw error;
  }
};
// Mövcud məhsulu yeniləmək
export const updateProduct = async (productData) => {
  const response = await axiosInstance.put(
    `${API_BASE_URL}/product/update`,
    productData
  );
  console.log("Update API response:", response.data);
  return response.data;
};
// ✅ Məhsul statusunu dəyişmək (PUT methodu ilə)
export const updateProductStatus = async (statusPayload) => {
  console.log("Status update payload:", statusPayload);
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/product/status-updated`,
      statusPayload
    );
    console.log("Response:", response);
    return response.data;
  } catch (error) {
    console.error("API updateProductStatus error:", error.response || error);
    throw error;
  }
};

// Məhsulları axtarmaq (filtrlərlə)
export const searchProducts = async (filters) => {
  // filters - obyekt, məsələn { name: 'abc', status: 'ACTIVE' }
  const response = await axiosInstance.post(
    `${API_BASE_URL}/product/search`,
    filters
  );
  return response.data;
};

// Bütün məhsulları oxumaq
export const getAllProducts = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/product/read`);
  return response.data;
};

// ID üzrə məhsulu oxumaq
export const getProductById = async (id) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/product/read-by-id/${id}`
  );
  return response.data;
};

// Məhsulu silmək
export const deleteProduct = async (id) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/product/delete/${id}`
  );
  return response.data;
};
