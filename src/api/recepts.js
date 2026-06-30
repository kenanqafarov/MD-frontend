// src/api/recepts.js
import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

export const createRecipe = async (data) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/recipe/create`,
    data
  );
  return response.data;
};

export const updateRecipe = async (id, data) => {
  const response = await axiosInstance.put(
    `${API_BASE_URL}/recipe/update/${id}`,
    data
  );
  return response.data;
};

export const updateRecipeStatus = async (id, status) => {
  const response = await axiosInstance.patch(
    `${API_BASE_URL}/recipe/update-status/${id}`,
    { status }
  );
  return response.data;
};

export const searchRecipes = async (params) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/recipe/search`, {
    params,
  });
  return response.data;
};

export const readAllRecipes = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/recipe/read`);
  return response.data;
};

export const readRecipeList = async () => {
  // This endpoint is for fetching a simplified list (e.g., ID and Name)
  const response = await axiosInstance.get(`${API_BASE_URL}/recipe/read-list`);
  return response.data;
};

export const readRecipeById = async (id) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/recipe/read-by-id`,
    {
      params: { id },
    }
  );
  return response.data;
};

export const exportRecipeExcel = async () => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/recipe/export/excel`,
    {
      responseType: "blob", // Excel yükləmək üçün lazımdır
    }
  );
  return response.data;
};

export const deleteRecipe = async (id) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/recipe/delete/${id}`
  );
  return response.data;
};