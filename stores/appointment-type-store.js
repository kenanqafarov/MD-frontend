import { create } from "zustand";
import {
  createAppointmentType,
  readAppointmentTypes,
  updateAppointmentType,
  updateAppointmentTypeStatus,
  deleteAppointmentType,
  searchAppointmentTypes,
} from "../src/api/appointment-type";

const useAppointmentTypeStore = create((set) => ({
  appointmentTypes: [],
  selectedAppointmentType: null,
  loading: false,
  error: null,

  // Read all
  fetchAppointmentTypes: async () => {
    set({ loading: true, error: null });
    try {
      const data = await readAppointmentTypes();
      set({ appointmentTypes: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // Create
  addAppointmentType: async (newData) => {
    set({ loading: true, error: null });
    try {
      await createAppointmentType(newData);
      await useAppointmentTypeStore.getState().fetchAppointmentTypes();
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // Update
  updateAppointmentType: async (updatedData) => {
    set({ loading: true, error: null });
    try {
      await updateAppointmentType(updatedData);
      await useAppointmentTypeStore.getState().fetchAppointmentTypes();
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // Update status
  updateAppointmentTypeStatus: async (statusData) => {
    set({ loading: true, error: null });
    try {
      await updateAppointmentTypeStatus(statusData);
      await useAppointmentTypeStore.getState().fetchAppointmentTypes();
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // Delete
  removeAppointmentType: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteAppointmentType(id);
      await useAppointmentTypeStore.getState().fetchAppointmentTypes();
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // Search
  searchAppointmentTypes: async (searchParams) => {
    set({ loading: true, error: null });
    try {
      const data = await searchAppointmentTypes(searchParams);
      set({ appointmentTypes: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },
}));

export default useAppointmentTypeStore;
