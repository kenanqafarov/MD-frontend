import { create } from "zustand";
import warehouseStockRoomApiService from "../src/api/warehouse-room";

const useWarehouseStockRoomStore = create((set, get) => ({
  cabinetStockData: [],
  loading: false,
  error: null,
  roomName: "",
  categoryName: "",
  productName: "",
  productNo: "",

  setRoomName: (name) => set({ roomName: name }),
  setCategoryName: (category) => set({ categoryName: category }),
  setProductName: (name) => set({ productName: name }),
  setProductNo: (no) => set({ productNo: no }),

  /**
   * Searches for room stock using POST with the specified payload format.
   * Sends null for empty roomName, categoryName, and productName to avoid enum coercion issues.
   */
  searchRoomStock: async () => {
    set({ loading: true, error: null });
    try {
      const state = get();
      const payload = {
        roomName: state.roomName || null, // Send null instead of "" for roomName
        categoryName: state.categoryName || null, // Send null instead of "" for categoryName
        productName: state.productName || null, // Send null instead of "" for productName
        productNo: state.productNo ? parseInt(state.productNo, 10) : 0, // Keep 0 for productNo
      };

      const response = await warehouseStockRoomApiService.searchRoomStock(
        payload
      );
      set({ cabinetStockData: response.data || [], loading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch room stock data";
      set({ error: errorMessage, loading: false });
      console.error("Room stock search failed:", error);
    }
  },

  resetCabinetStockData: () =>
    set({
      cabinetStockData: [],
      roomName: "STOM1", // Ensure reset also sets it to 'STOM1'
      categoryName: "",
      productName: "",
      productNo: "",
    }),
}));

export default useWarehouseStockRoomStore;
