import { create } from "zustand";
import {
  createAnamnesisCategory,
  updateAnamnesisCategory,
  updateAnamnesisCategoryStatus,
  searchAnamnesisCategories,
  readAnamnesisCategories,
  readAnamnesisCategoryById,
  exportAnamnesisCategoryToExcel,
  deleteAnamnesisCategory,
} from "../src/api/anamnesisCategory";

const useAnamnesisCategoryStore = create((set) => ({
  categories: [],
  categoryDetails: null,
  loading: false,
  error: null,
  totalPages: 0,
  totalElements: 0,

  // Fetch all categories as simple list
  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      // Use read endpoint with pagination instead of read-list (which may not be supported by backend)
      const data = await readAnamnesisCategories({ page: 0, count: 1000 });
      // Extract data array from paginated response
      const categories = Array.isArray(data.data) ? data.data : [];
      set({
        categories,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
        loading: false,
      });
    } catch (error) {
      set({ error, loading: false });
      console.error("Error fetching categories:", error);
    }
  },

  // Fetch categories with pagination
  fetchCategoriesWithPagination: async (page = 0, count = 10) => {
    set({ loading: true, error: null });
    try {
      const data = await readAnamnesisCategories({ page, count });
      set({
        categories: Array.isArray(data.data) ? data.data : [],
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
        loading: false,
      });
    } catch (error) {
      set({ error, loading: false });
      console.error("Error fetching categories with pagination:", error);
    }
  },

  // Search categories
  searchCategories: async (searchRequest, page = 0, count = 10) => {
    set({ loading: true, error: null });
    try {
      const data = await searchAnamnesisCategories(searchRequest, { page, count });
      set({
        categories: Array.isArray(data.data) ? data.data : [],
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
        loading: false,
      });
    } catch (error) {
      set({ error, loading: false });
      console.error("Error searching categories:", error);
    }
  },

  fetchCategoryById: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await readAnamnesisCategoryById(id);
      // Clean up category data - separate category info from anamnesis list
      const cleanCategoryData = {
        id: data.id,
        name: data.name || "",
        status: data.status || "ACTIVE",
        anemnesisListReadResponse: data.anemnesisListReadResponse || [],
      };
      set({ categoryDetails: cleanCategoryData, loading: false });
    } catch (error) {
      set({ error, loading: false });
      console.error("Error fetching category by ID:", error);
    }
  },

  addCategory: async (newCategory) => {
    set({ loading: true, error: null });
    try {
      await createAnamnesisCategory(newCategory);
      await useAnamnesisCategoryStore.getState().fetchCategories();
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error, loading: false });
      console.error("Error adding category:", error);
      throw error;
    }
  },

  updateCategory: async (id, updatedCategory) => {
    set({ loading: true, error: null });
    try {
      await updateAnamnesisCategory(id, updatedCategory);
      await useAnamnesisCategoryStore.getState().fetchCategories();
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error, loading: false });
      console.error("Error updating category:", error);
      throw error;
    }
  },

  updateCategoryStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      await updateAnamnesisCategoryStatus(id, status);
      await useAnamnesisCategoryStore.getState().fetchCategories();
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error, loading: false });
      console.error("Error updating category status:", error);
      throw error;
    }
  },

  deleteCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteAnamnesisCategory(id);
      await useAnamnesisCategoryStore.getState().fetchCategories();
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error, loading: false });
      console.error("Error deleting category:", error);
      throw error;
    }
  },

  exportToExcel: async () => {
    set({ loading: true, error: null });
    try {
      const response = await exportAnamnesisCategoryToExcel();
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "anamnesis-categories.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error, loading: false });
      console.error("Error exporting categories:", error);
      throw error;
    }
  },
}));

export default useAnamnesisCategoryStore;
