import { create } from "zustand";
import {
    readCategoryAndOperationItems as apiReadCategoryAndOperationItems,
    createPatientPlan as apiCreatePatientPlan,
    readPatientPlans as apiReadPatientPlans,
    deletePatientPlanItem as apiDeletePatientPlanItem,
    savePatientPlan as apiSavePatientPlan,
} from "../src/api/patient-plans-controller";

const usePatientPlansControllerStore = create((set) => ({
    selectedCategoryAndOperationItems: null,
    patientPlansData: null,
    loading: false,
    error: null,

    fetchCategoryAndOperationItems: async (id) => {
        set({ loading: true, error: null });
        try {
            const data = await apiReadCategoryAndOperationItems(id);
            set({ selectedCategoryAndOperationItems: data, loading: false });
        } catch (error) {
            set({
                error: error.message || "Category and operation items reading error",
                loading: false,
            });
        }
    },
    createPatientPlan: async (planData) => {
        set({ loading: true, error: null });
        try {
            const response = await apiCreatePatientPlan(planData);
            set({ loading: false });
            return { success: true, data: response, status: 200 };
        } catch (error) {
            const status = error.response?.status;
            set({ 
                error: error.message || "Patient plan creation error", 
                loading: false 
            });
            return { success: false, error, status };
        }
    },

    readPatientPlans: async (id) => {
        set({ loading: true, error: null });
        try {
            const data = await apiReadPatientPlans(id);
            set({ patientPlansData: data, loading: false });
            return { success: true, data, status: 200 };
        } catch (error) {
            const status = error.response?.status;
            set({ 
                error: error.message || "Patient plans reading error", 
                loading: false 
            });
            return { success: false, error, status };
        }
    },

    deletePatientPlanItem: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await apiDeletePatientPlanItem(id);
            set({ loading: false });
            return { success: true, data: response, status: 200 };
        } catch (error) {
            const status = error.response?.status;
            set({ 
                error: error.message || "Patient plan item deletion error", 
                loading: false 
            });
            return { success: false, error, status };
        }
    },

    savePatientPlan: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await apiSavePatientPlan(id);
            set({ loading: false });
            return { success: true, data: response, status: 200 };
        } catch (error) {
            const status = error.response?.status;
            set({ 
                error: error.message || "Patient plan save error", 
                loading: false 
            });
            return { success: false, error, status };
        }
    },

}));

export default usePatientPlansControllerStore;
