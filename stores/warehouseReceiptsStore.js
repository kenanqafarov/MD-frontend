// src/store/warehouseReceiptsStore.js
import { create } from 'zustand';
import {
  searchWarehouseReceipts,
  updateWarehouseReceiptPendingStatus,
  getWarehouseReceiptInfo
} from '../src/api/warehouse-receipts'; 

const useWarehouseReceiptsStore = create((set, get) => ({
  receipts: [],
  selectedReceiptDetails: null,
  loading: false,
  error: null,
  searchParams: {
    pendingStatus: 'WAITING', // Varsayılan axtarış statusu
    date: new Date().toISOString().split('T')[0], // Varsayılan olaraq cari tarix (YYYY-MM-DD)
    time: '00:00:00' // HH:mm:ss formatında string
  },

  setSearchParams: (params) => set((state) => ({
    searchParams: { ...state.searchParams, ...params }
  })),

  fetchReceipts: async () => {
    set({ loading: true, error: null });
    try {
      const params = get().searchParams;
      // Backend HH:mm:ss formatında string gözlədiyi üçün,
      // əgər time inputu HH:mm formatında dəyər verirsə, saniyə hissəsini əlavə edirik.
      const formattedParams = {
        ...params,
        time: params.time && params.time.length === 5 ? `${params.time}:00` : params.time
      };

      const data = await searchWarehouseReceipts(formattedParams);
      set({ receipts: data, loading: false });
    } catch (err) {
      console.error("Failed to fetch warehouse receipts:", err);
      set({ error: "An error occurred while fetching warehouse receipts.", loading: false });
    }
  },

  updateReceiptStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const updatedReceipt = await updateWarehouseReceiptPendingStatus({ id, status });
      set((state) => ({
        receipts: state.receipts.map((receipt) =>
          receipt.id === id ? { ...receipt, pendingStatus: updatedReceipt.pendingStatus } : receipt
        ),
        loading: false,
      }));
      // Əgər cari ətraflı görünüş bu qəbz üçündürsə, detalları yenidən yükləyirik
      if (get().selectedReceiptDetails?.id === id) {
        get().fetchReceiptDetails(id);
      }
    } catch (err) {
      console.error(`Failed to update status for receipt ${id}:`, err);
      set({ error: `Failed to update status for receipt ${id}.`, loading: false });
    }
  },

  fetchReceiptDetails: async (id) => {
    set({ loading: true, error: null, selectedReceiptDetails: null });
    try {
      const details = await getWarehouseReceiptInfo(id);
      set({ selectedReceiptDetails: details, loading: false });
    } catch (err) {
      console.error(`Failed to fetch details for receipt ${id}:`, err);
      set({ error: `Failed to fetch details for receipt ${id}.`, loading: false });
    }
  },

  clearSelectedReceiptDetails: () => set({ selectedReceiptDetails: null }),
}));

export default useWarehouseReceiptsStore;