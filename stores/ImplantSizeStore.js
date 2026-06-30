import { create } from "zustand";
import {
  createImplantSize,
  readImplantSizes,
  updateImplantSize,
  updateImplantSizeStatus,
  searchImplantSizes,
  searchImplantSizesByStatus,
  deleteImplantSize,
} from "../src/api/ImplantSize";
import axiosInstance from "../src/api/temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const useImplantSizeStore = create((set, get) => ({
  implants: [],
  implantSizes: [],
  loading: false,
  error: null,

  fetchImplantsWithSizes: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/implant/read`);
      set({ implants: response.data, loading: false });
      console.log("Implants from store:", response.data);
    } catch (err) {
      set({ error: err.message || "Failed to fetch implants", loading: false });
    }
  },

  fetchImplantSizes: async () => {
    set({ loading: true, error: null });
    try {
      const data = await readImplantSizes();
      set({ implantSizes: data, loading: false });
    } catch (err) {
      set({
        error: err.message || "Failed to fetch implant sizes",
        loading: false,
      });
    }
  },

  addImplantSize: async (newData) => {
    set({ loading: true, error: null });
    try {
      const response = await createImplantSize(newData);
      set({
        implantSizes: [...get().implantSizes, response],
        loading: false,
      });
      return response; // Uğurlu olduqda response qaytarın
    } catch (err) {
      set({
        error: err.message || "Failed to create implant size",
        loading: false,
      });
      throw err; // Xətanı yenidən throw edin ki, komponentdə tutula bilsin
    }
  },

  // ... qalan funksiyalar eyni qalır
  editImplantSize: async (updatedData) => {
    set({ loading: true, error: null });
    try {
      const data = await updateImplantSize(updatedData);
      set({
        implantSizes: get().implantSizes.map((item) =>
          item.id === updatedData.id ? { ...item, ...data } : item
        ),
        loading: false,
      });
    } catch (err) {
      set({
        error: err.message || "Failed to update implant size",
        loading: false,
      });
    }
  },

  removeImplantSize: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteImplantSize(id);
      set({
        implantSizes: get().implantSizes.filter((item) => item.id !== id),
        loading: false,
      });
    } catch (err) {
      set({
        error: err.message || "Failed to delete implant size",
        loading: false,
      });
    }
  },

  updateStatus: async (statusData) => {
    set({ loading: true, error: null });
    try {
      const data = await updateImplantSizeStatus(statusData);
      set({
        implantSizes: get().implantSizes.map((item) =>
          item.id === statusData.id ? { ...item, ...data } : item
        ),
        loading: false,
      });
    } catch (err) {
      set({ error: err.message || "Failed to update status", loading: false });
    }
  },

  searchImplantSizes: async (searchData) => {
    set({ loading: true, error: null });
    try {
      const data = await searchImplantSizes(searchData);
      set({ implantSizes: data, loading: false });
    } catch (err) {
      set({
        error: err.message || "Failed to search implant sizes",
        loading: false,
      });
    }
  },

  searchByStatus: async (statusData) => {
    set({ loading: true, error: null });
    try {
      const data = await searchImplantSizesByStatus(statusData);
      set({ implantSizes: data, loading: false });
    } catch (err) {
      set({
        error: err.message || "Failed to search by status",
        loading: false,
      });
    }
  },
}));

export default useImplantSizeStore;
