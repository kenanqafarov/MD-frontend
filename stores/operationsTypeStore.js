import { create } from "zustand";
import {
  createOperationTypes,
  updateOperationTypes,
  updateOperationTypesStatus,
  searchOperationTypes,
  readOperationTypes,
  readOperationTypesList,
  readOperationTypesById,
  exportOperationTypesToExcel,
  deleteOperationTypes,
} from "../src/api/operationsType";

const useOperationTypesStore = create((set) => ({
  operationTypes: [],
  operationTypesList: [],
  selectedOperationType: null,
  loading: false,
  error: null,

  // ✔ Fetch all
  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const data = await readOperationTypes();
      set({ operationTypes: data?.data || [], loading: false });
    } catch (err) {
      set({ error: err, loading: false });
    }
  },

  // ✔ Fetch for dropdown
  fetchList: async () => {
    try {
      const data = await readOperationTypesList();
      set({ operationTypesList: data });
    } catch (err) {
      console.error("Dropdown list error:", err);
    }
  },

  // ✔ Fetch by ID
  fetchById: async (id) => {
    try {
      const data = await readOperationTypesById(id);
      set({ selectedOperationType: data });
    } catch (err) {
      console.error("Fetch by ID error:", err);
    }
  },

  // ✔ Create
  create: async (payload) => {
    try {
      await createOperationTypes(payload);
      await useOperationTypesStore.getState().fetchAll();
    } catch (err) {
      console.error("Create error:", err);
      throw err;
    }
  },

  // ✔ Update
  update: async (id, payload) => {
    try {
      await updateOperationTypes(id, payload);
      await useOperationTypesStore.getState().fetchAll();
    } catch (err) {
      console.error("Update error:", err);
      throw err;
    }
  },

  // ✔ Update status
  updateStatus: async (id, statusData) => {
    try {
      await updateOperationTypesStatus(id, statusData);
      await useOperationTypesStore.getState().fetchAll();
    } catch (err) {
      console.error("Status update error:", err);
    }
  },

  // ✔ Delete
  remove: async (id) => {
    try {
      await deleteOperationTypes(id);
      await useOperationTypesStore.getState().fetchAll();
    } catch (err) {
      console.error("Delete error:", err);
    }
  },

  // ✔ Search
  search: async (params) => {
    set({ loading: true });
    try {
      const data = await searchOperationTypes(params);
      set({ operationTypes: data?.data || [], loading: false });
    } catch (err) {
      set({ error: err, loading: false });
    }
  },

  // ✔ Export
  exportToExcel: async () => {
    try {
      const blob = await exportOperationTypesToExcel();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "operation-types.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export error:", err);
    }
  },

  // ✔ Clear selected
  clearSelected: () => set({ selectedOperationType: null }),
}));

export default useOperationTypesStore;
