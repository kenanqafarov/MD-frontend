import { create } from "zustand";
import {
  createGarniture,
  updateGarniture,
  updateGarnitureStatus,
  searchGarnitures,
  getAllGarnitures,
  getGarnitureList,
  getGarnitureById,
  exportGarnituresToExcel,
  deleteGarnitureById,
} from "../src/api/garniture";

const useGarnitureStore = create((set) => ({
  garnitures: [],
  selectedGarniture: null,
  loading: false,
  error: null,

  // Fetch all garnitures
  fetchGarnitures: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getAllGarnitures();
      const garnitures = response.data || [];
      set({ garnitures, loading: false });
    } catch (error) {
      console.error(error);
      set({ error: error.message || "Xəta baş verdi", loading: false });
    }
  },

  // Fetch garniture by ID
  fetchGarnitureById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await getGarnitureById(id);
      const selectedGarniture = response.data || null;
      set({ selectedGarniture, loading: false });
    } catch (error) {
      set({ error: error.message || "Xəta baş verdi", loading: false });
    }
  },

  // Create new garniture
  addGarniture: async (newData) => {
    set({ loading: true, error: null });
    try {
      await createGarniture(newData);
      await useGarnitureStore.getState().fetchGarnitures(); // listi yenilə
    } catch (error) {
      set({ error: error.message || "Xəta baş verdi", loading: false });
    }
  },

  // Update garniture
  editGarniture: async (id, updateData) => {
    set({ loading: true, error: null });
    try {
      await updateGarniture(id, updateData);
      await useGarnitureStore.getState().fetchGarnitures();
    } catch (error) {
      set({ error: error.message || "Xəta baş verdi", loading: false });
    }
  },

  // Update garniture status
  updateStatus: async (id, statusData) => {
    set({ loading: true, error: null });
    try {
      await updateGarnitureStatus(id, statusData);
      await useGarnitureStore.getState().fetchGarnitures();
    } catch (error) {
      set({ error: error.message || "Xəta baş verdi", loading: false });
    }
  },

  // Delete garniture by ID
  removeGarniture: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteGarnitureById(id);
      await useGarnitureStore.getState().fetchGarnitures();
    } catch (error) {
      set({ error: error.message || "Xəta baş verdi", loading: false });
    }
  },

  // Search garnitures with params
  search: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await searchGarnitures(params);
      const garnitures = response.data?.data || [];
      set({ garnitures, loading: false });
    } catch (error) {
      set({ error: error.message || "Xəta baş verdi", loading: false });
    }
  },

  // Export garnitures to Excel
  exportExcel: async () => {
    try {
      const response = await exportGarnituresToExcel();
      return response;
    } catch (error) {
      set({ error: error.message || "Xəta baş verdi" });
    }
  },

  // Get simple garniture list (without pagination etc)
  fetchGarnitureList: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getGarnitureList();
      // ✅ DÜZƏLİŞ: API artıq data-nı qaytarır (array), ona görə birbaşa response istifadə olunur
      set({ garnitures: response || [], loading: false });
    } catch (error) {
      console.error("Error fetching garniture list:", error);
      set({ error: error.message || "Xəta baş verdi", loading: false });
    }
  },
}));

export default useGarnitureStore;
