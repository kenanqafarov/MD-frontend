import { create } from "zustand";
import {
  createPatientTreatment,
  savePatientTreatment,
  readPatientTreatmentByPlanMainId,
  readCategoryAndOperationsByPlanMainId,
} from "../src/api/treatmentApi";

const useTreatmentStore = create((set) => ({
  loading: false,
  error: null,
  selectedCategoryAndOperationItems: null,

  /**
   * Patient treatment yaratmaq
   * @param {Object} data - Request body
   * @param {string} data.planMainId - Plan main ID
   * @param {Array} data.patientPlansRequests - Patient plans requests array
   * @returns {Promise} API response
   */
  createPatientTreatment: async (data) => {
    set({ loading: true, error: null });
    try {
      const result = await createPatientTreatment(data);
      set({ loading: false });
      return result;
    } catch (error) {
      const errorResponse = {
        success: false,
        status: error.response?.status || 500,
        error: error,
        data: error.response?.data || null,
      };
      set({ error: errorResponse, loading: false });
      return errorResponse;
    }
  },

  /**
   * Patient treatment save etmək
   * @param {Object} data - Request body
   * @param {Array<string>} data.checkedPlanIds - Checked plan IDs array
   * @returns {Promise} API response
   */
  savePatientTreatment: async (data) => {
    set({ loading: true, error: null });
    try {
      const result = await savePatientTreatment(data);
      set({ loading: false });
      return result;
    } catch (error) {
      const errorResponse = {
        success: false,
        status: error.response?.status || 500,
        error: error,
        data: error.response?.data || null,
      };
      set({ error: errorResponse, loading: false });
      return errorResponse;
    }
  },

  /**
   * Patient treatment oxumaq plan main ID-yə görə
   * @param {string} planMainId - Plan main ID
   * @returns {Promise} API response
   */
  readPatientTreatmentByPlanMainId: async (planMainId) => {
    set({ loading: true, error: null });
    try {
      const result = await readPatientTreatmentByPlanMainId(planMainId);
      set({ loading: false });
      return result;
    } catch (error) {
      const errorResponse = {
        success: false,
        status: error.response?.status || 500,
        error: error,
        data: error.response?.data || null,
      };
      set({ error: errorResponse, loading: false });
      return errorResponse;
    }
  },

  /**
   * Patient treatment kateqoriya və əməliyyatları oxumaq plan main ID-yə görə
   * @param {string} planMainId - Plan main ID
   * @returns {Promise} API response
   */
  readCategoryAndOperationsByPlanMainId: async (planMainId) => {
    set({ loading: true, error: null });
    try {
      const result = await readCategoryAndOperationsByPlanMainId(planMainId);
      if (result.success && result.status === 200) {
        set({ 
          selectedCategoryAndOperationItems: result.data, 
          loading: false 
        });
      } else {
        set({ loading: false });
      }
      return result;
    } catch (error) {
      const errorResponse = {
        success: false,
        status: error.response?.status || 500,
        error: error,
        data: error.response?.data || null,
      };
      set({ error: errorResponse, loading: false });
      return errorResponse;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useTreatmentStore;

