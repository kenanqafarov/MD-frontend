import { create } from "zustand";
import {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  updateReservationStatus,
  deleteReservation,
  searchReservations,
  exportReservationsToExcel,
} from "../src/api/reservation";
import axios from "axios";
import axiosInstance from "../src/api/temp-axios-auth";
const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const useReservationStore = create((set) => ({
  reservations: [],
  selectedReservation: null,
  loading: false,
  error: null,
  searchResults: [],

  fetchReservations: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getAllReservations();
      set({ reservations: data.data, loading: false });
    } catch (error) {
      set({ error: error.message || "Xəta baş verdi", loading: false });
    }
  },

  fetchReservationById: async (id) => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/reservations/read-by-id/${id}`
      );
      set({ selectedReservation: response.data });
    } catch (error) {
      console.error("Error fetching reservation:", error);
      set({ error: error.message });
    }
  },

  addReservation: async (reservationData) => {
    set({ loading: true, error: null });
    try {
      await createReservation(reservationData);
      await useReservationStore.getState().fetchReservations();
    } catch (error) {
      set({ error: error.message || "Xəta baş verdi", loading: false });
      throw error;
    }
  },
  editReservation: async (id, updatedData) => {
    set({ loading: true, error: null });
    try {
      const response = await updateReservation(id, updatedData);
      // Instead of fetching all reservations, just update the selected one
      set((state) => ({
        selectedReservation: {
          ...state.selectedReservation,
          ...updatedData,
          // Include any fields that might be returned from the API
          ...response.data,
        },
        loading: false,
      }));
      return response.data; // Return the updated reservation
    } catch (error) {
      set({ error: error.message || "Xəta baş verdi", loading: false });
      throw error;
    }
  },

  changeReservationStatus: async (id, statusData) => {
    set({ loading: true, error: null });
    try {
      await updateReservationStatus(id, statusData);
      await useReservationStore.getState().fetchReservations();
    } catch (error) {
      set({ error: error.message || "Xəta baş verdi", loading: false });
      throw error;
    }
  },

  removeReservation: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteReservation(id);
      await useReservationStore.getState().fetchReservations();
    } catch (error) {
      set({ error: error.message || "Xəta baş verdi", loading: false });
      throw error;
    }
  },

  searchReservations: async (filters) => {
    set({ loading: true, error: null });
    try {
      const data = await searchReservations(filters);
      set({ searchResults: data.data, loading: false });
    } catch (error) {
      set({ error: error.message || "Xəta baş verdi", loading: false });
    }
  },

  exportToExcel: async () => {
    try {
      const blobData = await exportReservationsToExcel();
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "reservations.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      set({ error: error.message || "Xəta baş verdi" });
      throw error;
    }
  },

  clearSelectedReservation: () => set({ selectedReservation: null }),
  clearSearchResults: () => set({ searchResults: [] }),
}));

export default useReservationStore;
