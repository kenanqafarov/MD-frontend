import { create } from "zustand";
import {
  createExamination,
  updateExamination,
  updateExaminationStatus,
  searchExaminations,
  getAllExaminations,
  deleteExaminationById,
} from "../src/api/examination";

const useExaminationStore = create((set, get) => ({
  examinations: [],
  loading: false,
  error: null,

  // 🟢 Read all
  fetchAllExaminations: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getAllExaminations();
      set({ examinations: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // 🟢 Create
  createExamination: async (examinationData) => {
    set({ loading: true, error: null });
    try {
      const created = await createExamination(examinationData);
      set((state) => ({
        examinations: [...state.examinations, created],
        loading: false,
      }));
    } catch (error) {
      set({ error, loading: false });
      throw error;
    }
  },

  // 🟡 Update
  updateExamination: async (examinationData) => {
    set({ loading: true, error: null });
    try {
      const updated = await updateExamination(examinationData);
      set((state) => ({
        examinations: state.examinations.map((exam) =>
          exam.id === updated.id ? updated : exam
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error, loading: false });
      throw error;
    }
  },

  // 🟣 Update status
  updateExaminationStatus: async (statusData) => {
    set({ loading: true, error: null });
    try {
      const updated = await updateExaminationStatus(statusData);
      set((state) => ({
        examinations: state.examinations.map((exam) =>
          exam.id === updated.id ? updated : exam
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error, loading: false });
      throw error;
    }
  },

  // 🔍 Search
  searchExaminations: async (searchParams) => {
    set({ loading: true, error: null });
    try {
      const results = await searchExaminations(searchParams);
      set({ examinations: results, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // 🔴 Delete
  deleteExamination: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteExaminationById(id);
      set((state) => ({
        examinations: state.examinations.filter((exam) => exam.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error, loading: false });
      throw error;
    }
  },
}));

export default useExaminationStore;
