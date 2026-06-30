import { create } from "zustand";
import {
  createAnamnesisItem,
  updateAnamnesisItem,
  deleteAnamnesisItem,
  updateAnamnesisItemStatus,
  readAnamnesisItemById,
  readAnamnesisListAll,
  searchAnamnesisItems,
} from "../src/api/anamnesis-list";

const useAnamnesisListStore = create((set) => ({
  anamnesisList: [],
  selectedAnamnesis: null,
  loading: false,
  error: null,

  // Fetch anamnesis for a specific category (maintains backward compatibility)
  fetchAnamnesisList: async (categoryId) => {
    set({ loading: true, error: null });
    try {
      console.log("Fetching anamnesis for category:", categoryId);
      // Search for items by category
      const res = await searchAnamnesisItems(
        { anamnesisCategory: { id: categoryId } },
        { page: 0, count: 100 }
      );
      console.log("API response:", res);

      set({
        anamnesisList: Array.isArray(res.data) ? res.data : [],
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching anamnesis:", error);
      // Fallback: fetch all items if category-specific fetch fails
      try {
        const res = await readAnamnesisListAll();
        set({
          anamnesisList: Array.isArray(res) ? res : [],
          loading: false,
        });
      } catch (fallbackError) {
        set({ error, loading: false });
      }
    }
  },

  addAnamnesis: async (data) => {
    set({ loading: true, error: null });
    try {
      await createAnamnesisItem(data);
      if (data.anamnesisCategoryId) {
        await useAnamnesisListStore
          .getState()
          .fetchAnamnesisList(data.anamnesisCategoryId);
      } else {
        await useAnamnesisListStore.getState().fetchAllAnamnesis();
      }
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error, loading: false });
      throw error;
    }
  },

  editAnamnesis: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await updateAnamnesisItem(id, data);
      if (data.anamnesisCategoryId) {
        await useAnamnesisListStore
          .getState()
          .fetchAnamnesisList(data.anamnesisCategoryId);
      } else {
        await useAnamnesisListStore.getState().fetchAllAnamnesis();
      }
      set({ loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  removeAnamnesis: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteAnamnesisItem(id);
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error, loading: false });
      throw error;
    }
  },

  fetchAnamnesisById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await readAnamnesisItemById(id);
      set({ selectedAnamnesis: res, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  updateAnamnesisStatus: async (id, statusData) => {
    set({ loading: true, error: null });
    try {
      await updateAnamnesisItemStatus(id, statusData.status);
      set({ loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  fetchAllAnamnesis: async () => {
    set({ loading: true, error: null });
    try {
      const res = await readAnamnesisListAll();
      set({
        anamnesisList: Array.isArray(res) ? res : [],
        loading: false,
      });
    } catch (error) {
      set({ error, loading: false });
    }
  },
}));

export default useAnamnesisListStore;
