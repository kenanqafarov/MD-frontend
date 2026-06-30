import { create } from "zustand";
import {
  createPlans as createPlansAPI,
  fetchPlans as fetchPlansAPI,
  updatePlans as updatePlansAPI,
  deletePlans as deletePlansAPI,
} from "../src/api/plans-main";

const usePlansStore = create((set) => ({
  plans: null,
  loading: false,
  error: null,

  fetchPlans: async (patientId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetchPlansAPI(patientId);
      const status = response.status;
      if (status === 200) {
        set({ plans: response.data, loading: false });
        return { success: true, data: response.data, status };
      } else {
        set({ error: 'Unexpected status code', loading: false });
        return { success: false, error: 'Unexpected status code', status };
      }
    } catch (error) {
      const status = error.response?.status;
      set({ error, loading: false });
      return { success: false, error, status };
    }
  },

  createPlans: async (newData) => {
    set({ loading: true, error: null });
    try {
      const response = await createPlansAPI(newData);
      // API başarılı response döndürürse (200-299 arası)
      // Axios başarılı isteklerde otomatik olarak resolve olur
      const status = response.status;
      set({ plans: response.data, loading: false });
      return { success: true, data: response.data, status };
    } catch (error) {
      const status = error.response?.status;
      set({ error, loading: false });
      return { success: false, error, status };
    }
  },

  updatePlans: async (newData) => {
    set({ loading: true, error: null });
    try {
      const response = await updatePlansAPI(newData);
      // API başarılı response döndürürse (200-299 arası)
      // Axios başarılı isteklerde otomatik olarak resolve olur
      const status = response.status;
      set({ plans: response.data, loading: false });
      return { success: true, data: response.data, status };
    } catch (error) {
      const status = error.response?.status;
      set({ error, loading: false });
      return { success: false, error, status };
    }
  },

  deletePlans: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await deletePlansAPI(id);
      const status = response.status;
      set({ loading: false });
      return { success: true, status };
    } catch (error) {
      const status = error.response?.status;
      set({ error, loading: false });
      return { success: false, error, status };
    }
  },

}));

export default usePlansStore;