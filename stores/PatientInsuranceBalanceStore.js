import { create } from "zustand";
import {
  createPatientInsuranceBalance,
  updatePatientInsuranceBalance,
  updatePatientInsuranceBalanceStatus,
  readPatientInsuranceBalance,
  readPatientInsuranceBalanceById,
  deletePatientInsuranceBalance,
} from "../src/api/patient-insurance-balance";

const usePatientInsuranceBalanceStore = create((set, get) => ({
  balances: [],
  selectedBalance: null,
  loading: false,
  error: null,

  // ✔ Fetch all
  fetchBalances: async () => {
    set({ loading: true, error: null });
    try {
      const data = await readPatientInsuranceBalance();
      set({ balances: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // ✔ Fetch by ID
  fetchBalanceById: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await readPatientInsuranceBalanceById(id);
      set({ selectedBalance: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // ✔ Create
  addBalance: async (balanceData) => {
    try {
      const newBalance = await createPatientInsuranceBalance(balanceData);
      set({ balances: [...get().balances, newBalance] });
    } catch (err) {
      set({ error: err.message });
    }
  },

  // ✔ Update
  editBalance: async (id, balanceData) => {
    try {
      const updatedBalance = await updatePatientInsuranceBalance(
        id,
        balanceData
      );
      set({
        balances: get().balances.map((item) =>
          item.id === id ? updatedBalance : item
        ),
      });
    } catch (err) {
      set({ error: err.message });
    }
  },

  // ✔ Update Status
  changeBalanceStatus: async (id, statusData) => {
    try {
      const updatedBalance = await updatePatientInsuranceBalanceStatus(
        id,
        statusData
      );
      set({
        balances: get().balances.map((item) =>
          item.id === id ? updatedBalance : item
        ),
      });
    } catch (err) {
      set({ error: err.message });
    }
  },

  // ✔ Delete
  removeBalance: async (id) => {
    try {
      await deletePatientInsuranceBalance(id);
      set({
        balances: get().balances.filter((item) => item.id !== id),
      });
    } catch (err) {
      set({ error: err.message });
    }
  },
}));

export default usePatientInsuranceBalanceStore;
