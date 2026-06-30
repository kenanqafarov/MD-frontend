import { create } from "zustand";
import {
  createColor,
  updateColor,
  updateColorStatus,
  searchColor,
  readColor,
  readColorList,
  readColorById,
  deleteColor,
} from "../src/api/color";

const useColorStore = create((set) => ({
  colors: [],
  selectedColor: null,
  loading: false,
  error: null,

  fetchColors: async () => {
    set({ loading: true });
    try {
      const data = await readColor();
      set({ colors: data.data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  fetchColorList: async () => {
    set({ loading: true, error: null });
    try {
      const data = await readColorList();
      set({ colors: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  fetchColorById: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await readColorById(id);
      set({ selectedColor: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  addColor: async (colorData) => {
    set({ loading: true, error: null });
    try {
      const newColor = await createColor(colorData);
      set((state) => ({
        colors: [...state.colors, newColor],
        loading: false,
      }));
    } catch (error) {
      set({ error, loading: false });
    }
  },

  updateColor: async (id, colorData) => {
    set({ loading: true, error: null });
    try {
      const updated = await updateColor(id, colorData);
      set((state) => ({
        colors: state.colors.map((item) =>
          item.id === updated.id ? updated : item
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error, loading: false });
    }
  },

  updateStatus: async (id, statusData) => {
    set({ loading: true, error: null });
    try {
      const updated = await updateColorStatus(id, statusData);
      set((state) => ({
        colors: state.colors.map((item) =>
          item.id === updated.id ? updated : item
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error, loading: false });
    }
  },

  updateLocalStatus: (id, newStatus) => {
    set((state) => ({
      colors: state.colors.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      ),
    }));
  },

  searchColors: async (criteria) => {
    set({ loading: true, error: null });
    try {
      const results = await searchColor(criteria);
      set({ colors: results, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  removeColor: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteColor(id);
      set((state) => ({
        colors: state.colors.filter((item) => item.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error, loading: false });
    }
  },
}));

export default useColorStore;
