import { create } from "zustand";
import { createLaboratoryPayment, readLaboratoryPayments } from "../src/api/dentalOrderReport";

export const useLaboratoryPaymentStore = create((set, get) => ({
  // State variables
  payments: [],
  isLoading: false,
  error: null,

  // Actions
  /**
   * Fetches all laboratory payments from the API and updates the store state.
   */
  fetchPayments: async () => {
    set({ isLoading: true, error: null });
    try {
      const payments = await readLaboratoryPayments();
      set({ payments, isLoading: false });
    } catch (error) {
      set({
        error: error.message || "Failed to fetch payments.",
        isLoading: false,
      });
    }
  },

  /**
   * Creates a new laboratory payment and refetches the list on success.
   * @param {object} paymentData - The data for the new payment.
   * @param {string} paymentData.technicianId - The ID of the technician.
   * @param {number} paymentData.amount - The amount to be paid.
   */
  createPayment: async (paymentData) => {
    set({ isLoading: true, error: null });
    try {
      await createLaboratoryPayment(paymentData);
      // After a successful creation, re-fetch the payments to update the list.
      await get().fetchPayments();
    } catch (error) {
      set({
        error: error.message || "Failed to create payment.",
        isLoading: false,
      });
    }
  },
}));
