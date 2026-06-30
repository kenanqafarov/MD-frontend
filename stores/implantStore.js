import { create } from "zustand";
import {
  getAllImplants,
  createImplant,
  updateImplant,
  updateImplantStatus,
  searchImplants,
  deleteImplantById,
} from "../src/api/implant";

const useImplantStore = create((set) => ({
  implants: [],
  loading: false,
  error: null,

  // Bütün implantları gətir
  fetchImplants: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getAllImplants();
      const implants = data || [];
      set({ implants, loading: false });
    } catch (error) {
      set({ error: error.message || "Yükləmə zamanı xəta", loading: false });
    }
  },

  // Yeni implant yarat
  addImplant: async (data) => {
    set({ loading: true, error: null });
    try {
      await createImplant(data);
      await useImplantStore.getState().fetchImplants();
    } catch (error) {
      set({ error: error.message || "Yaratma zamanı xəta", loading: false });
    }
  },

  // Implantı yenilə
  editImplant: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await updateImplant(id, data);
      await useImplantStore.getState().fetchImplants();
      set({ loading: false });
    } catch (error) {
      set({ error: error.message || "Yeniləmə zamanı xəta", loading: false });
    }
  },

  // Statusu dəyiş
  changeStatus: async (implantId, status) => {
    set({ loading: true, error: null });
    try {
      await updateImplantStatus({ implantId, status });
      await useImplantStore.getState().fetchImplants();
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Axtarış
  searchImplants: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await searchImplants(params);
      const implants = data || [];
      set({ implants, loading: false });
    } catch (error) {
      set({ error: error.message || "Axtarış zamanı xəta", loading: false });
    }
  },

  // Implantı sil
  removeImplant: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteImplantById(id);
      await useImplantStore.getState().fetchImplants();
    } catch (error) {
      set({ error: error.message || "Silinmə zamanı xəta", loading: false });
    }
  },
  setSelectedImplant: (implant) => {
    set({ selectedImplant: implant });
  },
}));

export default useImplantStore;
