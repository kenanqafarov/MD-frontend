import { create } from "zustand";
import {
  createInsuranceCompany,
  updateInsuranceCompany,
  updateInsuranceCompanyStatus,
  searchInsuranceCompany,
  readInsuranceCompany,
  readInsuranceCompanyList,
  readInsuranceCompanyById,
  exportInsuranceCompanyToExcel,
  deleteInsuranceCompany,
} from "../src/api/insurance";

const useInsuranceCompanyStore = create((set) => ({
  insuranceCompanies: [],
  insuranceCompanyList: [],
  selectedCompany: null,
  loading: false,
  error: null,

  // ✔ Fetch all
  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const response = await readInsuranceCompany();
      // Backenddən gələn cavab:
      // { totalPages, totalElements, data: [...] }
      set({ insuranceCompanies: response.data || [], loading: false });
    } catch (err) {
      set({ error: err.message || err, loading: false });
    }
  },
  // ✔ Fetch dropdown list
  fetchList: async () => {
    try {
      const data = await readInsuranceCompanyList();
      set({ insuranceCompanyList: data });
    } catch (err) {
      console.error("Dropdown list error:", err);
    }
  },

  // ✔ Fetch by ID
  fetchById: async (id) => {
    try {
      const data = await readInsuranceCompanyById(id);
      set({ selectedCompany: data });
    } catch (err) {
      console.error("Fetch by ID error:", err);
    }
  },

  // ✔ Create
  create: async (formData) => {
    try {
      await createInsuranceCompany(formData);
      await useInsuranceCompanyStore.getState().fetchAll();
    } catch (err) {
      console.error("Create error:", err);
    }
  },

  // ✔ Update
  update: async (id, formData) => {
    try {
      await updateInsuranceCompany(id, formData);
      await useInsuranceCompanyStore.getState().fetchAll();
    } catch (err) {
      console.error("Update error:", err);
    }
  },

  // ✔ Update Status
  updateStatus: async (id, statusData) => {
    try {
      await updateInsuranceCompanyStatus(id, statusData);
      await useInsuranceCompanyStore.getState().fetchAll();
    } catch (err) {
      console.error("Status update error:", err);
    }
  },

  // ✔ Delete
  remove: async (id) => {
    try {
      await deleteInsuranceCompany(id);
      await useInsuranceCompanyStore.getState().fetchAll();
    } catch (err) {
      console.error("Delete error:", err);
    }
  },

  // ✔ Search
  search: async (params) => {
    set({ loading: true });
    try {
      const data = await searchInsuranceCompany(params);
      set({ insuranceCompanies: data, loading: false });
    } catch (err) {
      set({ error: err, loading: false });
    }
  },

  // ✔ Export Excel
  exportToExcel: async () => {
    try {
      const blob = await exportInsuranceCompanyToExcel();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "insurance-companies.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Excel export error:", err);
    }
  },

  // ✔ Reset selected
  clearSelected: () => set({ selectedCompany: null }),
}));

export default useInsuranceCompanyStore;
