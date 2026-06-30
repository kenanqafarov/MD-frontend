import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// Yeni əməliyyat əlavə et
export const createTeethOperation = async (data) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/teeth-operation/create`,
    data
  );
  return response.data;
};

// Əməliyyatları axtar
export const searchTeethOperations = async (searchParams) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/teeth-operation/search`,
    searchParams
  );
  return response.data;
};

// Əməliyyatı yenilə
export const updateTeethOperation = async (data) => {
  // Lazımsız boş dəyərləri silmək
  Object.keys(data).forEach((key) => {
    if (data[key] === "" || data[key] === undefined || data[key] === null) {
      delete data[key];
    }
  });

  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/teeth-operation/update`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Update error:", error.response?.data || error.message);
    throw error;
  }
};

// Bütün əməliyyatları oxu
export const getAllTeethOperations = async () => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/teeth-operation/read`
  );
  return response.data;
};

// Əməliyyatı ID-səsinə görə oxu
export const getTeethOperationById = async (id) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/teeth-operation/read-by-id/${id}`
  );
  return response.data;
};

// Əməliyyatı sil
export const deleteTeethOperation = async (id) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/teeth-operation/delete/${id}`
  );
  return response.data;
};
