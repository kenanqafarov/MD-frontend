// src/store/useSpecializationStore.js
import { create } from "zustand";
import {
  createSpecialization,
  readSpecializations,
  updateSpecialization,
  deleteSpecialization,
} from "../src/api/specialization";

const useSpecializationStore = create((set, get) => ({
  specializations: [],
  loading: false,
  error: null,

  fetchSpecializations: async () => {
    set({ loading: true, error: null });
    try {
      const data = await readSpecializations();
      set({ specializations: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addSpecialization: async (specializationData) => {
    set({ loading: true, error: null });
    try {
      await createSpecialization(specializationData);
      await get().fetchSpecializations();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  editSpecialization: async (specializationData) => {
    set({ loading: true, error: null });
    try {
      await updateSpecialization(specializationData);
      await get().fetchSpecializations();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  removeSpecialization: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteSpecialization(id);
      await get().fetchSpecializations();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));

export default useSpecializationStore;