import { create } from "zustand";
import {
  createAnamnesisItem,
  updateAnamnesisItem,
  updateAnamnesisItemStatus,
  searchAnamnesisItems,
  readAnamnesisItems,
  readAnamnesisListAll,
  readAnamnesisItemById,
  exportAnamnesisItemsToExcel,
  deleteAnamnesisItem,
} from "../src/api/anamnesis-list";

const useAnamnesisListItemStore = create((set) => ({
  items: [],
  itemDetails: null,
  loading: false,
  error: null,
  totalPages: 0,
  totalElements: 0,

  // Fetch all items as list
  fetchAllItems: async () => {
    set({ loading: true, error: null });
    try {
      const data = await readAnamnesisListAll();
      set({
        items: Array.isArray(data) ? data : [],
        loading: false,
      });
    } catch (error) {
      set({ error, loading: false });
      console.error("Error fetching anamnesis items:", error);
    }
  },

  // Fetch items with pagination
  fetchItemsWithPagination: async (page = 0, count = 10) => {
    set({ loading: true, error: null });
    try {
      const data = await readAnamnesisItems({ page, count });
      set({
        items: Array.isArray(data.data) ? data.data : [],
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
        loading: false,
      });
    } catch (error) {
      set({ error, loading: false });
      console.error("Error fetching anamnesis items with pagination:", error);
    }
  },

  // Search items
  searchItems: async (searchRequest, page = 0, count = 10) => {
    set({ loading: true, error: null });
    try {
      const data = await searchAnamnesisItems(searchRequest, { page, count });
      set({
        items: Array.isArray(data.data) ? data.data : [],
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
        loading: false,
      });
    } catch (error) {
      set({ error, loading: false });
      console.error("Error searching anamnesis items:", error);
    }
  },

  // Fetch item by ID
  fetchItemById: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await readAnamnesisItemById(id);
      // Ensure we store the item data correctly
      const cleanItemData = {
        id: data.id,
        name: data.name || "",
        status: data.status || "ACTIVE",
        // Optionally store category separately if needed
        anamnesisCategory: data.anamnesisCategory || null,
      };
      set({ itemDetails: cleanItemData, loading: false });
    } catch (error) {
      set({ error, loading: false });
      console.error("Error fetching anamnesis item by ID:", error);
    }
  },

  // Create new item
  addItem: async (newItem) => {
    set({ loading: true, error: null });
    try {
      await createAnamnesisItem(newItem);
      await useAnamnesisListItemStore.getState().fetchAllItems();
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error, loading: false });
      console.error("Error creating anamnesis item:", error);
      throw error;
    }
  },

  // Update item
  updateItem: async (id, updatedData) => {
    set({ loading: true, error: null });
    try {
      await updateAnamnesisItem(id, updatedData);
      await useAnamnesisListItemStore.getState().fetchAllItems();
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error, loading: false });
      console.error("Error updating anamnesis item:", error);
      throw error;
    }
  },

  // Update item status
  updateItemStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      await updateAnamnesisItemStatus(id, status);
      await useAnamnesisListItemStore.getState().fetchAllItems();
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error, loading: false });
      console.error("Error updating anamnesis item status:", error);
      throw error;
    }
  },

  // Delete item
  deleteItem: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteAnamnesisItem(id);
      await useAnamnesisListItemStore.getState().fetchAllItems();
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error, loading: false });
      console.error("Error deleting anamnesis item:", error);
      throw error;
    }
  },

  // Export to Excel
  exportToExcel: async () => {
    set({ loading: true, error: null });
    try {
      const response = await exportAnamnesisItemsToExcel();
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "anamnesis-list.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error, loading: false });
      console.error("Error exporting anamnesis items:", error);
      throw error;
    }
  },
}));

export default useAnamnesisListItemStore;
