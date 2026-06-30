import { create } from 'zustand';
import {
  createPatientAnamnesis,
  updatePatientAnamnesis,
  getAllPatientAnamnesis,
  getPatientAnamnesisByPatientId,
  deletePatientAnamnesis,
} from '../src/api/patient-anamnesis';

const useAnamnesisStore = create((set) => ({
  anamnesisList: [],
  isLoading: false,
  error: null,

  // Load all anamnesis entries
  loadAllAnamnesis: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getAllPatientAnamnesis();
      set({ anamnesisList: data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
      console.error("Failed to load all anamnesis:", err);
    }
  },

  // Load anamnesis entries for a specific patient
  loadAnamnesisByPatientId: async (patientId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getPatientAnamnesisByPatientId(patientId);
      set({ anamnesisList: data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
      console.error("Failed to load anamnesis for patient:", err);
    }
  },

  // Add a new anamnesis entry
  addAnamnesis: async (anamnesisData) => {
    set({ isLoading: true, error: null });
    try {
      const newAnamnesis = await createPatientAnamnesis(anamnesisData);
      set((state) => ({
        anamnesisList: [...state.anamnesisList, newAnamnesis],
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err.message, isLoading: false });
      console.error("Failed to add anamnesis:", err);
      throw err; // Re-throw the error to be handled by the component
    }
  },

  // Update an existing anamnesis entry
  updateAnamnesis: async (id, anamnesisData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedAnamnesis = await updatePatientAnamnesis(id, anamnesisData);
      set((state) => ({
        anamnesisList: state.anamnesisList.map((item) =>
          item.id === id ? updatedAnamnesis : item
        ),
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err.message, isLoading: false });
      console.error("Failed to update anamnesis:", err);
      throw err;
    }
  },

  // Delete an anamnesis entry
  deleteAnamnesis: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deletePatientAnamnesis(id);
      set((state) => ({
        anamnesisList: state.anamnesisList.filter((item) => item.id !== id),
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err.message, isLoading: false });
      console.error("Failed to delete anamnesis:", err);
      throw err;
    }
  },
}));

export default useAnamnesisStore;