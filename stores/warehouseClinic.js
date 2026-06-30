// src/store/warehouseStore.js
import { create } from 'zustand';
import warehouseClinic from '../src/api/warehouse-clinic';

const useWarehouseStoreClinic = create((set) => ({
  warehouseData: [],
  loading: false,
  error: null,
  searchTerm: '',
  selectedCategory: '', // For your dropdown filter

  setSearchTerm: (term) => set({ searchTerm: term }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  fetchWarehouseData: async () => {
    set({ loading: true, error: null });
    try {
      const response = await warehouseClinic.readWarehouse();
      // Assuming the API returns an array of items directly or in a 'data' field
      set({ warehouseData: response.data || response, loading: false });
    } catch (error) {
      set({ error: error, loading: false });
      console.error('Failed to fetch warehouse data:', error);
    }
  },

  searchWarehouse: async (payload) => {
    set({ loading: true, error: null });
    try {
      const response = await warehouseClinic.searchWarehouse(payload);
      // Assuming the API returns an array of items directly or in a 'data' field
      set({ warehouseData: response.data || response, loading: false });
    } catch (error) {
      set({ error: error, loading: false });
      console.error('Failed to search warehouse:', error);
    }
  },

  // You might want an action to clear search results or reset to initial state
  resetWarehouseData: () => set({ warehouseData: [], searchTerm: '', selectedCategory: '' }),
}));

export default useWarehouseStoreClinic;