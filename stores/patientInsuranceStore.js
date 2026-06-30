import { create } from "zustand";
import {
  createPatientInsurance,
  getPatientInsurance,
  updatePatientInsurance,
  deletePatientInsurance,
  updatePatientInsuranceStatus,
} from "../src/api/patient-insurance";

const usePatientInsuranceStore = create((set) => ({
  patientInsurance: null,
  loading: false,
  error: null,

  fetchPatientInsurance: async (patientId) => {
    set({ loading: true, error: null });
    try {
      const data = await getPatientInsurance(patientId);
      set({ patientInsurance: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  createPatientInsurance: async (newData) => {
    set({ loading: true, error: null });
    try {
      const data = await createPatientInsurance(newData);
      set({ patientInsurance: data, loading: false });
      return { success: true, data };
    } catch (error) {
      set({ error, loading: false });
      throw error;
    }
  },

  updatePatientInsurance: async (id, updatedData) => {
    set({ loading: true, error: null });
    try {
      const data = await updatePatientInsurance(id, updatedData);
      set({ patientInsurance: data, loading: false });
      return { success: true, data };
    } catch (error) {
      set({ error, loading: false });
      throw error;
    }
  },

  deletePatientInsurance: async (id) => {
    set({ loading: true, error: null });
    try {
      await deletePatientInsurance(id);
      set({ patientInsurance: null, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  updateStatus: async (id, patientId) => {
    set({ loading: true, error: null });
    try {
      const data = await updatePatientInsuranceStatus(id, patientId);
      set({ patientInsurance: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },
  clearPatientInsurance: () => set({ patientInsurance: null }),
}));

export default usePatientInsuranceStore;
