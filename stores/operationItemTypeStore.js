import { create } from "zustand";
import {
  createOperationItemsType,
  updateOperationItemsType,
  updateOperationItemsTypeStatus,
  searchOperationItemsType,
  readOperationItemsType,
  readOperationItemsTypeById,
  exportOperationItemsTypeToExcel,
  deleteOperationItemsType,
} from "../src/api/operationTypeItem";

const useOperationItemsTypeStore = create((set) => ({
  operationItemsType: [],
  operationItemsTypeList: [],
  selectedOperationItemsType: null,
  loading: false,
  error: null,

  fetchAllOp: async (categoryId) => {
    if (!categoryId) {
      set({ error: "Category ID is required", loading: false });
      return;
    }
    set({ loading: true, error: null });
    try {
      const response = await readOperationItemsType(categoryId);
      // response: { totalPages, totalElements, data: [...] }
      set({ operationItemsType: response.data || [], loading: false });
    } catch (err) {
      set({ error: err.message || err, loading: false });
    }
  },

  // ID ilə məlumat gətir
  fetchById: async (id) => {
    try {
      const data = await readOperationItemsTypeById(id);
      set({ selectedOperationItemsType: data });
    } catch (err) {
      console.error("Fetch by ID error:", err);
    }
  },

  // Yeni operation items type yarat
  create: async (payload) => {
    try {
      await createOperationItemsType(payload);
      await useOperationItemsTypeStore.getState().fetchAllOp();
    } catch (err) {
      console.error("Create error:", err);
      throw err;
    }
  },

  // Mövcud operation items type yenilə
  updateOp: async (id, payload) => {
    try {
      await updateOperationItemsType(id, payload);
      await useOperationItemsTypeStore.getState().fetchAllOp();
    } catch (err) {
      console.error("Update error:", err);
      throw err;
    }
  },

  updateStatus: async (id, statusData) => {
    try {
      await updateOperationItemsTypeStatus(id, statusData);
      await useOperationItemsTypeStore.getState().fetchAllOp(); // siyahını yenilə
    } catch (err) {
      console.error("Status update error:", err);
    }
  },

  // Sil
  remove: async (id, categoryId) => {
    try {
      await deleteOperationItemsType(id);
      if (categoryId) {
        await useOperationItemsTypeStore.getState().fetchAllOp(categoryId);
      } else {
        await useOperationItemsTypeStore.getState().fetchAllOp();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  },
  // Axtarış
  search: async (params) => {
    set({ loading: true });
    try {
      const data = await searchOperationItemsType(params);
      set({ operationItemsType: data?.data || [], loading: false });
    } catch (err) {
      set({ error: err, loading: false });
    }
  },

  // Excel-ə export
  exportToExcel: async () => {
    try {
      const blob = await exportOperationItemsTypeToExcel();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "operation-items-type.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export error:", err);
    }
  },

  // Seçilmişi təmizlə
  clearSelected: () => set({ selectedOperationItemsType: null }),
}));

export default useOperationItemsTypeStore;
