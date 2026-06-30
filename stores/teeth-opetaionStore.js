import { create } from "zustand";
import {
  createTeethOperation,
  searchTeethOperations,
  updateTeethOperation,
  getAllTeethOperations,
  getTeethOperationById,
  deleteTeethOperation,
} from "../src/api/teeth-operation";

const useTeethOperationStore = create((set, get) => ({
  teethOperations: [],
  operationDetails: null,
  loading: false,
  error: null,

  fetchAllTeethOperations: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getAllTeethOperations();
      set({ teethOperations: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // 📌 Read by ID
  fetchOperationById: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await getTeethOperationById(id);
      set({ operationDetails: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
      throw error;
    }
  },

  createTeethOperations: async (operationData) => {
    set({ loading: true, error: null });
    try {
      const created = await createTeethOperation(operationData);
      set((state) => ({
        teethOperations: [...state.teethOperations, created],
        loading: false,
      }));
    } catch (error) {
      set({ error, loading: false });
    }
  },

  updateTeethOperations: async (operationData) => {
    set({ loading: true, error: null });
    try {
      const updated = await updateTeethOperation(operationData);
      set((state) => ({
        teethOperations: state.teethOperations.map((op) =>
          op.id === updated.id ? updated : op
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error, loading: false });
      throw error;
    }
  },

  removeTeethOperations: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteTeethOperation(id);
      set((state) => ({
        teethOperations: state.teethOperations.filter((op) => op.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error, loading: false });
      throw error;
    }
  },

  searchTeethOperations: async (searchParams) => {
    set({ loading: true, error: null });
    try {
      const results = await searchTeethOperations(searchParams);
      set({ teethOperations: results, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },
}));

export default useTeethOperationStore;
