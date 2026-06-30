import { create } from "zustand";
import {
  createMedicine,
  readMedicine,
  readMedicineById,
  updateMedicine,
  deleteMedicine,
  searchMedicine,
  updateMedicineStatus,
  exportMedicineToExcel,
} from "../src/api/medicine";

const useMedicineStore = create((set) => ({
  medicines: [],
  selectedMedicine: null,
  loading: false,
  error: null,

  // 📦 Get all medicines
  fetchMedicines: async (recipeId) => {
    set({ loading: true, error: null });
    try {
      const data = await readMedicine(recipeId); // Burda recipeId gəlir
      set({ medicines: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // 🔍 Search medicines
  searchMedicines: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await searchMedicine(params);
      set({ medicines: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // ➕ Create new medicine
  addMedicine: async (newData) => {
    set({ loading: true, error: null });
    try {
      await createMedicine(newData);
      await useMedicineStore.getState().fetchMedicines();
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // ✏️ Update medicine
  editMedicine: async (id, updatedData) => {
    set({ loading: true, error: null });
    try {
      await updateMedicine(id, updatedData);
      await useMedicineStore.getState().fetchMedicines();
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // 🚮 Delete medicine
  removeMedicine: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteMedicine(id);
      await useMedicineStore.getState().fetchMedicines();
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // ✅ Update status
  changeMedicineStatus: async (id, statusData) => {
    set({ loading: true, error: null });
    try {
      await updateMedicineStatus(id, statusData);
      await useMedicineStore.getState().fetchMedicines();
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // 📄 Export to Excel
  downloadExcel: async () => {
    try {
      const blobData = await exportMedicineToExcel();
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "medicines.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      set({ error });
    }
  },

  // 🔎 Read single medicine
  fetchMedicineById: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await readMedicineById(id);
      set({
        selectedMedicine: data,
        loading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data || error,
        loading: false,
      });
    }
  },

  // 🧹 Reset selected medicine
  resetSelectedMedicine: () => {
    set({ selectedMedicine: null });
  },
}));

export default useMedicineStore;
