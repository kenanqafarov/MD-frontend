// stores/dentalOrderStore.js
import { create } from "zustand";
import {
  createDentalOrder,
  updateDentalOrder,
  updateTechnicOrderPrice,
  updateDentalOrderStatus,
  readTechnicOrders,
  readDentalOrders,
  readDentalWorkTypes,
  readDentalOrderById,
  deleteDentalOrder,
} from "../src/api/dental-order";

const useDentalOrderStore = create((set) => ({
  orders: [],
  technicOrders: [],
  dentalWorkTypes: [],
  currentOrder: null,
  loading: false,
  error: null,

  // Bütün sifarişləri oxu
  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const data = await readDentalOrders();
      set({ orders: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Texnik sifarişlərini oxu
  fetchTechnicOrders: async () => {
    set({ loading: true, error: null });
    try {
      const data = await readTechnicOrders();
      set({ technicOrders: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Dental iş növlərini oxu
  fetchDentalWorkTypes: async () => {
    set({ loading: true, error: null });
    try {
      const data = await readDentalWorkTypes();
      set({ dentalWorkTypes: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // ID-yə görə sifariş gətir
  fetchOrderById: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await readDentalOrderById(id);
      set({ currentOrder: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Yeni sifariş yarat
  addOrder: async (orderData) => {
    set({ loading: true, error: null });
    try {
      const data = await createDentalOrder(orderData);
      set((state) => ({ orders: [...state.orders, data], loading: false }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Mövcud sifarişi yenilə
  editOrder: async (orderData) => {
    set({ loading: true, error: null });
    try {
      const data = await updateDentalOrder(orderData);
      set((state) => ({
        orders: state.orders.map((o) => (o.id === data.id ? data : o)),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Texnik order qiyməti yenilə
  editTechnicOrderPrice: async (id, priceData) => {
    set({ loading: true, error: null });
    try {
      const data = await updateTechnicOrderPrice(id, priceData);
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // STATUS YENİLƏ - Düzgün yeniləmə ilə
  changeOrderStatus: async (statusData) => {
    set({ loading: true, error: null });
    try {
      console.log("Status update data in store:", statusData);

      const updateData = {
        id: Number(statusData.id),
        dentalWorkStatus: statusData.dentalWorkStatus,
      };

      const updatedOrder = await updateDentalOrderStatus(updateData);

      // Əmin olun ki, UI dərhal yenilənir
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === updatedOrder.id
            ? { ...order, dentalWorkStatus: updatedOrder.dentalWorkStatus }
            : order
        ),
        loading: false,
        error: null,
      }));

      console.log("Status successfully updated:", updatedOrder);
      return updatedOrder;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Xəta baş verdi";
      console.error("Status update error:", errorMessage);
      set({
        error: errorMessage,
        loading: false,
      });
      throw error;
    }
  },

  // Sifarişi sil
  removeOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteDentalOrder(id);
      set((state) => ({
        orders: state.orders.filter((o) => o.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));

export default useDentalOrderStore;
