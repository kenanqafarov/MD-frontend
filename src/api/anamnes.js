// api/anamnes.js
import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

export const createAnamnesis = (data) => {
  return axiosInstance.post(`${API_BASE_URL}/anamnesis-list/create`, data);
};

export const updateAnamnesis = (id, data) =>
  axiosInstance.put(`${API_BASE_URL}/anamnesis-list/update/${id}`, data);

export const updateAnamnesisStatus = (id, data) =>
  axiosInstance.patch(
    `${API_BASE_URL}/anamnesis-list/update/status/${id}`,
    data
  );

export const deleteAnamnesis = (id) =>
  axiosInstance.delete(`${API_BASE_URL}/anamnesis-list/delete/${id}`);

// Dəyişiklik burada - kateqoriyaya görə anamnez siyahısını əldə etmək üçün
export const getAnamnesisListByCategory = (categoryId) =>
  axiosInstance.get(`${API_BASE_URL}/anamnesis-categories/read-by-id/${categoryId}`)
    .then(response => {
      // API-dən gələn məlumatı frontend üçün uyğun formata çeviririk
      return {
        data: response.data.anemnesisListReadResponse || []
      };
    });

export const getAnamnesisById = (id) =>
  axiosInstance.get(`${API_BASE_URL}/anamnesis-list/read-by-id/${id}`);