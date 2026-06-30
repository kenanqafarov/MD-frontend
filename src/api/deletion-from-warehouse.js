// src/api/deletionFromWarehouseApi.js
import axiosInstance from "./temp-axios-auth";
const API_BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Anbardan silinmə əməliyyatlarının siyahısını oxuyur.
 */
export const readDeletionsFromWarehouse = async () => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/deletion-from-warehouse/read`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all deletions from warehouse:", error);
    throw error;
  }
};

/**
 * Yeni bir anbardan silinmə əməliyyatı yaradır.
 */
export const createDeletionFromWarehouse = async (data) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/deletion-from-warehouse/create`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating deletion from warehouse:", error);
    throw error;
  }
};

/**
 * ID-yə görə anbardan silinmə əməliyyatının məlumatlarını gətirir.
 */
export const getDeletionFromWarehouseInfo = async (id) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/deletion-from-warehouse/info/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching deletion from warehouse info for ID ${id}:`,
      error
    );
    throw error;
  }
};

/**
 * Mövcud bir anbardan silinmə əməliyyatını yeniləyir.
 */
export const updateDeletionFromWarehouse = async (data) => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/deletion-from-warehouse/update`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating deletion from warehouse:", error);
    throw error;
  }
};

/**
 * ID-yə görə anbardan silinmə əməliyyatını silir.
 */
export const deleteDeletionFromWarehouse = async (id) => {
  try {
    const response = await axiosInstance.delete(
      `${API_BASE_URL}/deletion-from-warehouse/delete/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error deleting deletion from warehouse with ID ${id}:`,
      error
    );
    throw error;
  }
};

/**
 * Anbardan silinmə əməliyyatlarında axtarış edir.
 */
export const searchDeletionsFromWarehouse = async (filters) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/deletion-from-warehouse/search`,
      filters
    );
    return response.data;
  } catch (error) {
    console.error("Error searching deletions from warehouse:", error);
    throw error;
  }
};
