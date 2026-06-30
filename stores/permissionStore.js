import { create } from "zustand";
import {
  createPermission as apiCreatePermission,
  fetchPermissions as apiFetchPermissions,
  fetchPermissionById as apiFetchPermissionById,
  updatePermission as apiUpdatePermission,
  updatePermissionStatus as apiUpdatePermissionStatus,
  searchPermissions as apiSearchPermissions,
  deletePermission as apiDeletePermission,
} from "../src/api/permission";

const usePermissionStore = create((set) => ({
  permissions: [],
  selectedPermission: null,
  loading: false,
  error: null,

  // ✅ Bütün icazələri gətir
  fetchPermissions: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiFetchPermissions();
      set({ permissions: data, loading: false });
    } catch (error) {
      set({
        error: error.message || "İcazələri gətirə bilmədik",
        loading: false,
      });
    }
  },

  

  // ✅ ID ilə icazə gətir
  fetchPermissionById: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await apiFetchPermissionById(id);
      set({ selectedPermission: data, loading: false });
    } catch (error) {
      set({ error: error.message || "ID tapılmadı", loading: false });
    }
  },

  // ✅ Yeni permission yarat
  createPermission: async (newPermission) => {
    set({ loading: true, error: null });
    try {
      const created = await apiCreatePermission(newPermission);
      set((state) => ({
        permissions: [...state.permissions, created],
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message || "Yaratmaqda xəta", loading: false });
    }
  },

  // 🔄 Permission yenilə
  updatePermission: async (updatedPermission) => {
    set({ loading: true, error: null });
    try {
      const updated = await apiUpdatePermission(updatedPermission);
      set((state) => ({
        permissions: state.permissions.map((perm) =>
          perm.id === updated.id ? updated : perm
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message || "Yeniləməkdə xəta", loading: false });
    }
  },

  // 🔄 Status yenilə
  updatePermissionStatus: async (statusData) => {
    set({ loading: true, error: null });
    try {
      const updated = await apiUpdatePermissionStatus(statusData);
      set((state) => ({
        permissions: state.permissions.map((perm) =>
          perm.id === updated.id ? updated : perm
        ),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error.message || "Statusu yeniləməkdə xəta",
        loading: false,
      });
    }
  },

  // 🔍 Axtarış et
  searchPermissions: async (criteria) => {
    set({ loading: true, error: null });
    try {
      const results = await apiSearchPermissions(criteria);
      set({ permissions: results, loading: false });
    } catch (error) {
      set({ error: error.message || "Axtarışda xəta", loading: false });
    }
  },

  // ❌ Silmə əməliyyatı
  deletePermission: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiDeletePermission(id);
      set((state) => ({
        permissions: state.permissions.filter((perm) => perm.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message || "Silinmədə xəta", loading: false });
    }
  },
}));

export default usePermissionStore;
