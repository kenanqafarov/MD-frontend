import { create } from "zustand";
import {
  createMetals,
  updateMetals,
  updateMetalsStatus,
  searchMetals,
  readMetals,
  readMetalsList,
  readMetalsById,
  exportMetalsToExcel,
  deleteMetals,
} from "../src/api/metals";

const useMetalStore = create((set) => ({
  metals: [],
  selectedMetal: null,
  loading: false,
  error: null,

  // ✔ Fetch All
  fetchMetals: async () => {
    set({ loading: true, error: null });
    try {
      const response = await readMetals();
      set({ metals: response.data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },
  // ✔ Fetch by ID
  fetchMetalById: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await readMetalsById(id);
      set({ selectedMetal: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // ✔ Search
  searchMetals: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await searchMetals(params);
      set({ metals: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // ✔ Create
  createMetal: async (formData) => {
    set({ loading: true, error: null });
    try {
      const data = await createMetals(formData);
      set((state) => ({ metals: [...state.metals, data], loading: false }));
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // ✔ Update
  updateMetal: async (id, formData) => {
    set({ loading: true, error: null });
    try {
      const data = await updateMetals(id, formData);
      set((state) => ({
        metals: state.metals.map((m) => (m.id === id ? data : m)),
        loading: false,
      }));
    } catch (error) {
      set({ error, loading: false });
    }
  },

  updateMetalStatus: async (id, statusData) => {
    set({ loading: true, error: null });
    try {
      await updateMetalsStatus(id, statusData); // burada id undefined olmamalıdır
      await useMetalStore.getState().fetchMetals();
      set({ loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // ✔ Delete
  deleteMetal: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteMetals(id);
      set((state) => ({
        metals: state.metals.filter((m) => m.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // ✔ Export Excel
  exportExcel: async () => {
    try {
      const blob = await exportMetalsToExcel();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "metals.xlsx");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Export error", error);
    }
  },
}));

export default useMetalStore;
