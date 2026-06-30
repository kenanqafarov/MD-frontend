// src/api/laboratory-payment.js
import axiosInstance from './temp-axios-auth'; // Düzgün yolu import edin

// API_BASE_URL artıq temp-axios-auth.js-də təyin olunur və axiosInstance-a verilir.
// Bu satır artık gereksiz ama silmek yerine comment olarak bırakıyoruz
// const API_BASE_URL = import.meta.env.VITE_BASE_URL || '/api/v1'; 

/**
 * Yeni laboratoriya ödənişi yaradır.
 * @param {object} paymentData - Ödəniş məlumatları ({ technicianId: string, amount: number })
 * @returns {Promise<object>} - API cavabı
 */
export const createLaboratoryPayment = async (paymentData) => {
  try {
    console.log(
      "Creating laboratory payment with data:",
      JSON.stringify(paymentData, null, 2)
    );
    // axiosInstance avtomatik olaraq Authorization başlığını əlavə edəcək
    const response = await axiosInstance.post(
      `laboratory-payment/create`,
      paymentData
    );
    console.log("Laboratory payment created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating laboratory payment:", error);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
    } else if (error.request) {
      console.error("Error request:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    throw error;
  }
};

/**
 * Bütün laboratoriya ödənişlərini oxuyur.
 * @returns {Promise<Array<object>>} - Texniklərin ödəniş məlumatlarının siyahısı
 */
export const readLaboratoryPayments = async () => {
  try {
    console.log("Fetching laboratory payments...");
    // axiosInstance avtomatik olaraq Authorization başlığını əlavə edəcək
    const response = await axiosInstance.get(
      `laboratory-payment/read`
    );
    console.log("Laboratory payments fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error reading laboratory payments:", error);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
    } else if (error.request) {
      console.error("Error request:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    throw error;
  }
};