import { create } from "zustand";
import {
  createPatient,
  editPatient,
  readPatients,
  readPatientById,
  deletePatient,
  searchPatients,
  exportPatientsToExcel,
} from "../src/api/patient";

const usePatientStore = create((set, get) => ({
  patients: [],
  selectedPatient: null,
  loading: false,
  error: null,

  // Read all patients
  fetchPatients: async () => {
    set({ loading: true, error: null });
    try {
      const data = await readPatients();
      set({ patients: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // Read single patient by ID - Cache check ilə
  fetchPatientById: async (id) => {
    // Cache check - əgər artıq selectedPatient varsa və eyni ID-dirsə, yenidən fetch etmə
    const current = get().selectedPatient;
    if (current?.id === id) {
      return current;
    }
    
    set({ loading: true, error: null });
    try {
      const data = await readPatientById(id);
      set({ selectedPatient: data, loading: false });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  // Add new patient - Optimistic update
  addPatient: async (patientData) => {
    set({ loading: true, error: null });
    try {
      const newPatient = await createPatient(patientData);
      // Optimistic update - bütün list-i yenidən fetch etmə
      set((state) => ({
        patients: [newPatient, ...state.patients],
        loading: false,
      }));
      return newPatient;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  // Update patient - Optimistic update
  updatePatient: async (patientData) => {
    set({ loading: true, error: null });
    try {
      const updated = await editPatient(patientData);
      // Optimistic update
      set((state) => ({
        patients: state.patients.map((p) =>
          p.id === updated.id ? updated : p
        ),
        selectedPatient:
          state.selectedPatient?.id === updated.id
            ? updated
            : state.selectedPatient,
        loading: false,
      }));
      return updated;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  // Edit patient - alias for updatePatient
  editPatient: async (patientData) => {
    return get().updatePatient(patientData);
  },

  // Delete patient - Optimistic update
  removePatient: async (id) => {
    set({ loading: true, error: null });
    try {
      await deletePatient(id);
      // Optimistic update
      set((state) => ({
        patients: state.patients.filter((p) => p.id !== id),
        selectedPatient:
          state.selectedPatient?.id === id ? null : state.selectedPatient,
        loading: false,
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  // Search patients
  searchPatients: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await searchPatients(params);
      set({ patients: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // Export to Excel
  exportPatients: async () => {
    try {
      await exportPatientsToExcel();
    } catch (err) {
      set({ error: err.message });
    }
  },
}));

// Selector helper funksiyaları - Re-render optimizasiyası üçün
export const usePatients = () => usePatientStore((state) => state.patients);
export const useSelectedPatient = () =>
  usePatientStore((state) => state.selectedPatient);
export const usePatientLoading = () =>
  usePatientStore((state) => state.loading);
export const usePatientError = () => usePatientStore((state) => state.error);
export const usePatientActions = () =>
  usePatientStore((state) => ({
    fetchPatients: state.fetchPatients,
    fetchPatientById: state.fetchPatientById,
    addPatient: state.addPatient,
    updatePatient: state.updatePatient,
    editPatient: state.editPatient,
    removePatient: state.removePatient,
    searchPatients: state.searchPatients,
    exportPatients: state.exportPatients,
  }));

export default usePatientStore;
