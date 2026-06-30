import { create } from "zustand";
import {
  createCabinet,
  updateCabinet,
  deleteCabinetById,
  getAllCabinets,
  searchCabinets,
  updateCabinetStatus,
} from "../src/api/cabinet";

const useCabinetStore = create((set) => ({
  cabinets: [],
  loading: false,
  error: null,

  // Get all cabinets
  fetchCabinets: async () => {
    set({ loading: true });
    try {
      const data = await getAllCabinets();
      set({ cabinets: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // Search cabinets
  searchCabinets: async (params) => {
    set({ loading: true });
    try {
      const data = await searchCabinets(params);
      set({ cabinets: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // Create cabinet
  createCabinet: async (newCabinet) => {
    set({ loading: true });
    try {
      await createCabinet(newCabinet);
      await useCabinetStore.getState().fetchCabinets(); // Yenilə
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // Update cabinet
  updateCabinet: async (updatedCabinet) => {
    set({ loading: true });
    try {
      await updateCabinet(updatedCabinet);
      await useCabinetStore.getState().fetchCabinets();
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // Update cabinet status
  updateStatus: async (statusData) => {
    set({ loading: true });
    try {
      await updateCabinetStatus(statusData);
      await useCabinetStore.getState().fetchCabinets();
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // Delete cabinet
  deleteCabinet: async (id) => {
    set({ loading: true });
    try {
      await deleteCabinetById(id);
      await useCabinetStore.getState().fetchCabinets();
    } catch (error) {
      set({ error, loading: false });
    }
  },
}));

export default useCabinetStore;
