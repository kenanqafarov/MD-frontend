import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Creates a new laboratory payment.
 * @param {object} paymentData - The payment data.
 * @param {string} paymentData.technicianId - The ID of the technician.
 * @param {number} paymentData.amount - The amount to be paid.
 */
export const createLaboratoryPayment = async (paymentData) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/laboratory-payment/create`,
      paymentData
    );
    console.log("Payment created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating payment:", error);
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
 * Reads all laboratory payments.
 * @returns {Promise<Array<object>>} - An array of payment objects.
 */
export const readLaboratoryPayments = async () => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/laboratory-payment/read`
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error reading payments:", error);
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
