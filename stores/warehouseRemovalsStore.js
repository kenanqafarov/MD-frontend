// src/store/warehouseRemovalsStore.js
import { create } from 'zustand';
import {
  searchWarehouseRemovals,
  readAllWarehouseRemovals,
  getWarehouseRemovalInfo
} from '../src/api/warehouse-removals'; // Bu yolun düzgün olduğuna əmin olun!

import { getWorkerInfo } from '../src/api/add-worker'; // *** YENİ: add-worker API-dən getWorkerInfo import edilir ***

const useWarehouseRemovalsStore = create((set, get) => ({
  removals: [],
  selectedRemovalDetails: null,
  loading: false,
  error: null,
  searchParams: {
    date: new Date().toISOString().split('T')[0],
    time: '00:00:00'
  },
  searchTerm: '',
  workersCache: {}, // *** YENİ: İşçi adlarını saxlamaq üçün cache ***

  setSearchParams: (params) => set((state) => ({
    searchParams: { ...state.searchParams, ...params }
  })),

  setSearchTerm: (term) => set({ searchTerm: term }),

  // *** YENİ: İşçi adını ID ilə gətirən funksiya ***
  fetchWorkerName: async (workerId) => {
    if (!workerId) return null; // ID yoxdursa null qaytar
    const cachedWorker = get().workersCache[workerId];
    if (cachedWorker) {
      return cachedWorker; // Cache-dən qaytar
    }

    try {
      const workerInfo = await getWorkerInfo(workerId);
      const fullName = `${workerInfo.name || ''} ${workerInfo.surname || ''}`.trim();
      set((state) => ({
        workersCache: {
          ...state.workersCache,
          [workerId]: fullName,
        },
      }));
      return fullName;
    } catch (err) {
      console.error(`Failed to fetch worker info for ID ${workerId}:`, err);
      // Xəta olarsa, ID-ni qaytarın və ya boş string
      return `Bilinmir (${workerId})`;
    }
  },

  fetchAllRemovals: async () => {
    set({ loading: true, error: null });
    try {
      const data = await readAllWarehouseRemovals();
      set({ removals: data, loading: false });
    } catch (err) {
      console.error("Failed to fetch all warehouse removals:", err);
      set({ error: "An error occurred while fetching warehouse removals.", loading: false });
    }
  },

  fetchRemovals: async () => {
    set({ loading: true, error: null });
    try {
      const params = get().searchParams;
      const formattedParams = {
        ...params,
        time: params.time && params.time.length === 5 ? `${params.time}:00` : params.time
      };

      const data = await searchWarehouseRemovals(formattedParams);
      
      const filteredData = data.filter(removal => {
        const lowerCaseSearchTerm = get().searchTerm.toLowerCase();
        return (
          removal.room?.toLowerCase().includes(lowerCaseSearchTerm) ||
          removal.personWhoPlacedOrder?.toLowerCase().includes(lowerCaseSearchTerm) || // personWhoPlacedOrder-də ID varsa, bu hissə sonra düzəldiləcək
          removal.date?.includes(lowerCaseSearchTerm) ||
          removal.time?.includes(lowerCaseSearchTerm)
        );
      });
      
      set({ removals: filteredData, loading: false });
    } catch (err) {
      console.error("Failed to fetch warehouse removals:", err);
      set({ error: "An error occurred while fetching warehouse removals.", loading: false });
    }
  },

  fetchRemovalDetails: async (id) => {
    set({ loading: true, error: null, selectedRemovalDetails: null });
    try {
      const details = await getWarehouseRemovalInfo(id);
      set({ selectedRemovalDetails: details, loading: false });
    } catch (err) {
      console.error(`Failed to fetch details for removal ${id}:`, err);
      set({ error: `Failed to fetch details for removal ${id}.`, loading: false });
    }
  },

  clearSelectedRemovalDetails: () => set({ selectedRemovalDetails: null }),
}));

export default useWarehouseRemovalsStore;