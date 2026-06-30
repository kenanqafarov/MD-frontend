import { create } from "zustand";
import {
  createTechnician,
  searchTechnicians,
  updateTechnician,
  updateTechnicianStatus,
  getAllTechnicians,
  getTechnicianById,
  exportTechniciansToExcel,
  deleteTechnician,
} from "../src/api/technician";

const useTechnicianStore = create((set, get) => ({
  technicians: [],
  selectedTechnician: null,
  loading: false,
  error: null,

  fetchTechnicians: async () => {
    set({ loading: true, error: null });
    try {
      const res = await getAllTechnicians();
      set({ technicians: res.data, loading: false });
      return res.data;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  fetchTechnicianById: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await getTechnicianById(id);
      set({ selectedTechnician: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addTechnician: async (technicianData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await createTechnician(technicianData);
      set((state) => ({
        technicians: [...state.technicians, response.data],
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message,
        isLoading: false,
      });
      throw error; 
    }
  },

  searchTechs: async (filters) => {
    set({ loading: true });
    try {
      const data = await searchTechnicians(filters);
      set({ technicians: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  updateTech: async (id, updatedData) => {
    try {
      await updateTechnician(id, updatedData);
      await get().fetchTechnicians();
    } catch (err) {
      set({ error: err.message });
    }
  },

  updateTechStatus: async (id, status) => {
    try {
      await updateTechnicianStatus(id, status);
      await get().fetchTechnicians();
    } catch (err) {
      set({ error: err.message });
    }
  },

  removeTechnician: async (id) => {
    try {
      await deleteTechnician(id);
      await get().fetchTechnicians();
    } catch (err) {
      set({ error: err.message });
    }
  },

  exportToExcel: async () => {
    try {
      const blob = await exportTechniciansToExcel();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "technicians.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      set({ error: err.message });
    }
  },

  clearSelected: () => set({ selectedTechnician: null }),
}));

export default useTechnicianStore;
