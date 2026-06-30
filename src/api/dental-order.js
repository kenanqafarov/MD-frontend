// src/api/dentalOrderApi.js
import axiosInstance from "./temp-axios-auth";
const API_BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Yeni diş laboratoriya sifarişi yaradır.
 */
export const createDentalOrder = async (data) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/laboratory/order/create`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating dental order:", error);
    throw error;
  }
};

/**
 * Mövcud diş laboratoriya sifarişini yeniləyir.
 */
export const updateDentalOrder = async (data) => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/laboratory/order/update`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating dental order:", error);
    throw error;
  }
};

/**
 * Texnik sifarişi üçün qiymət təyin edir.
 */
export const updateTechnicOrderPrice = async (id, data) => {
  try {
    const response = await axiosInstance.patch(
      `${API_BASE_URL}/laboratory/technic/order/${id}/price`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating technic order price for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Sifarişin statusunu yeniləyir - QUERY PARAMETRLƏRİ İLƏ
 */
export const updateDentalOrderStatus = async (data) => {
  try {
    console.log("Sending status update:", data);

    const response = await axiosInstance.patch(
      `${API_BASE_URL}/laboratory/order/status`,
      data // Request body kimi göndəririk
    );
    return response.data;
  } catch (error) {
    console.error("Error updating dental order status:", error);
    throw error;
  }
};

/**
 * Texnikin sifarişlərini oxuyur.
 */
export const readTechnicOrders = async () => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/laboratory/technic/order/read`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching technic orders:", error);
    throw error;
  }
};

/**
 * Bütün sifarişləri oxuyur.
 */
export const readDentalOrders = async () => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/laboratory/order/read`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching dental orders:", error);
    throw error;
  }
};

/**
 * Mövcud diş işlərinin növlərini oxuyur.
 */
export const readDentalWorkTypes = async () => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/laboratory/order/read/dental-work-type`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching dental work types:", error);
    throw error;
  }
};

/**
 * ID-yə görə sifarişi oxuyur.
 */
export const readDentalOrderById = async (id) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/laboratory/order/read-by-id/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching dental order by ID ${id}:`, error);
    throw error;
  }
};

/**
 * ID-yə görə sifarişi silir.
 */
export const deleteDentalOrder = async (id) => {
  try {
    const response = await axiosInstance.delete(
      `${API_BASE_URL}/laboratory/order/delete/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error deleting dental order with ID ${id}:`, error);
    throw error;
  }
};
