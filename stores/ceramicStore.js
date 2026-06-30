import { create } from "zustand";
import {
  createCeramics,
  updateCeramics,
  updateCeramicsStatus,
  searchCeramics,
  readCeramics,
  readCeramicsList,
  readCeramicsById,
  exportCeramicsToExcel,
  deleteCeramics,
} from "../src/api/ceramic";

const useCeramicsStore = create((set) => ({
  ceramics: [],
  selectedCeramic: null,
  loading: false,
  error: null,

  // Fetch All
  fetchCeramics: async () => {
    set({ loading: true, error: null });
    try {
      const response = await readCeramics();
      set({ ceramics: response.data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // Fetch List (for dropdowns)
  fetchCeramicsList: async () => {
    set({ loading: true, error: null });
    try {
      const data = await readCeramicsList();
      set({ ceramics: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // Fetch by ID
  fetchCeramicById: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await readCeramicsById(id);
      set({ selectedCeramic: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // Search
  searchCeramics: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await searchCeramics(params);
      set({ ceramics: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // Create
  createCeramic: async (formData) => {
    set({ loading: true, error: null });
    try {
      const data = await createCeramics(formData);
      set((state) => ({ ceramics: [...state.ceramics, data], loading: false }));
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // Update
  updateCeramic: async (id, formData) => {
    set({ loading: true, error: null });
    try {
      const data = await updateCeramics(id, formData);
      set((state) => ({
        ceramics: state.ceramics.map((c) => (c.id === id ? data : c)),
        loading: false,
      }));
    } catch (error) {
      set({ error, loading: false });
    }
  },
  updateCeramicStatus: async (id, statusData) => {
    set({ loading: true, error: null });
    try {
      const updatedCeramic = await updateCeramicsStatus(id, statusData);
      set((state) => ({
        ceramics: state.ceramics.map((c) =>
          c.id === id ? { ...c, ...updatedCeramic } : c
        ),
        loading: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error?.message || error.toString();
      set({ error: new Error(errorMessage), loading: false });
    }
  },

  // Delete
  deleteCeramic: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteCeramics(id);
      set((state) => ({
        ceramics: state.ceramics.filter((c) => c.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // Export Excel
  exportExcel: async () => {
    set({ loading: true, error: null });
    try {
      const blob = await exportCeramicsToExcel();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "ceramics.xlsx");
      document.body.appendChild(link);
      link.click();
      set({ loading: false });
    } catch (error) {
      set({ error, loading: false });
      console.error("Export error", error);
    }
  },
}));

export default useCeramicsStore;
