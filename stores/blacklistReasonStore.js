import { create } from "zustand";
import {
  createBlackListResult,
  readBlackListResults,
  readBlackListResultById,
  updateBlackListResult,
  updateBlackListResultStatus,
  deleteBlackListResult,
  searchBlackListResults,
  exportBlackListResultsToExcel,
  readBlackListResultsList,
} from "../src/api/blacklistReason";

const useBlackListResultStore = create((set) => ({
  results: [],
  resultList: [],
  selectedResult: null,
  loading: false,
  error: null,

  // ✔ Read all
  fetchResults: async () => {
    set({ loading: true, error: null });
    try {
      const data = await readBlackListResults();
      set({ results: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // ✔ Read list (dropdown və s.)
  fetchResultList: async () => {
    set({ loading: true, error: null });
    try {
      const data = await readBlackListResultsList();
      set({ resultList: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // ✔ Read by ID
  fetchResultById: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await readBlackListResultById(id);
      set({ selectedResult: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // ✔ Create
  addResult: async (resultData) => {
    set({ loading: true, error: null });
    try {
      await createBlackListResult(resultData);
      await useBlackListResultStore.getState().fetchResults();
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // ✔ Update
  updateResult: async (id, resultData) => {
    set({ loading: true, error: null });
    try {
      await updateBlackListResult(id, resultData);
      await useBlackListResultStore.getState().fetchResults();
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // ✔ Update Status
  updateResultStatus: async (id, statusData) => {
    set({ loading: true, error: null });
    try {
      await updateBlackListResultStatus(id, statusData);
      await readBlackListResults(); // Yenidən siyahını yüklə
      set({ loading: false, error: null });
    } catch (error) {
      set({ error, loading: false });
    }
  },
  // ✔ Delete
  removeResult: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteBlackListResult(id);
      await useBlackListResultStore.getState().fetchResults();
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // ✔ Search
  searchResults: async (searchParams) => {
    set({ loading: true, error: null });
    try {
      const data = await searchBlackListResults(searchParams);
      set({ results: data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  // ✔ Export
  exportToExcel: async () => {
    try {
      const data = await exportBlackListResultsToExcel();
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "blacklist-results.xlsx");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      set({ error });
    }
  },
}));

export default useBlackListResultStore;
