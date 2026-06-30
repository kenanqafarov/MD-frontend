// src/stores/warehouseDeletionStore.js
import { create } from "zustand";
import {
  readDeletionsFromWarehouse, // GET /api/v1/deletion-from-warehouse/read
  createDeletionFromWarehouse, // POST /api/v1/deletion-from-warehouse/create
  getDeletionFromWarehouseInfo, // GET /api/v1/deletion-from-warehouse/info/{id}
  updateDeletionFromWarehouse, // PUT /api/v1/deletion-from-warehouse/update
  deleteDeletionFromWarehouse, // DELETE /api/v1/deletion-from-warehouse/delete/{id}
  searchDeletionsFromWarehouse, // POST /api/v1/deletion-from-warehouse/search
} from "../src/api/deletion-from-warehouse"; // Bu faylı aşağıda yaradacağıq

const useWarehouseDeletionStore = create((set, get) => ({
  deletions: [],
  selectedDeletion: null,
  loading: false,
  error: null,

  // Bütün anbar silinmə əməliyyatlarını çəkmək
  fetchDeletions: async () => {
    set({ loading: true, error: null });
    try {
      const data = await readDeletionsFromWarehouse();
      set({ deletions: data, loading: false });
    } catch (err) {
      set({
        error: err.message || "Anbar silinmələri gətirilərkən xəta baş verdi.",
        loading: false,
      });
      console.error("Anbar silinmələri gətirilərkən xəta:", err);
    }
  },

  // ID-yə görə anbar silinmə əməliyyatının detallarını çəkmək
  fetchDeletionById: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await getDeletionFromWarehouseInfo(id);
      set({ selectedDeletion: data, loading: false });
    } catch (err) {
      set({
        error:
          err.message || "Anbar silinmə detalı gətirilərkən xəta baş verdi.",
        loading: false,
      });
      console.error("Anbar silinmə detalı gətirilərkən xəta:", err);
    }
  },

  // Yeni anbar silinmə əməliyyatı yaratmaq
  createDeletion: async (deletionData) => {
    set({ loading: true, error: null });
    try {
      const newDeletion = await createDeletionFromWarehouse(deletionData);
      set((state) => ({
        deletions: [newDeletion, ...state.deletions],
        loading: false,
      }));
      return newDeletion; // Uğurlu əməliyyatdan sonra yeni obyekti qaytar
    } catch (err) {
      set({
        error: err.message || "Anbar silinməsi yaradılarkən xəta baş verdi.",
        loading: false,
      });
      throw err; // Xətanı yuxarıya ötür ki, komponentdə tutula bilsin
    }
  },

  // Anbar silinmə əməliyyatını yeniləmək
  updateDeletion: async (deletionData) => {
    set({ loading: true, error: null });
    try {
      const updatedDeletion = await updateDeletionFromWarehouse(deletionData);
      set((state) => ({
        deletions: state.deletions.map((deletion) =>
          deletion.id === updatedDeletion.id ? updatedDeletion : deletion
        ),
        loading: false,
        selectedDeletion: updatedDeletion, // Əgər redaktə olunan seçilmişdirsə onu da yenilə
      }));
      return updatedDeletion;
    } catch (err) {
      set({
        error: err.message || "Anbar silinməsi yenilənərkən xəta baş verdi.",
        loading: false,
      });
      throw err;
    }
  },

  // Anbar silinmə əməliyyatını silmək
  deleteDeletion: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteDeletionFromWarehouse(id);
      set((state) => ({
        deletions: state.deletions.filter((deletion) => deletion.id !== id),
        loading: false,
        selectedDeletion:
          state.selectedDeletion?.id === id ? null : state.selectedDeletion, // Silinən seçilmişdirsə null et
      }));
    } catch (err) {
      set({
        error: err.message || "Anbar silinməsi silinərkən xəta baş verdi.",
        loading: false,
      });
      throw err;
    }
  },

  // Anbar silinmə əməliyyatlarında axtarış etmək
  searchDeletions: async (filters) => {
    set({ loading: true, error: null });
    try {
      const data = await searchDeletionsFromWarehouse(filters);
      set({ deletions: data, loading: false }); // Axtarış nəticəsini ana siyahıya tətbiq edirik
    } catch (err) {
      set({
        error: err.message || "Axtarış zamanı xəta baş verdi.",
        loading: false,
      });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
  clearSelectedDeletion: () => set({ selectedDeletion: null }),
}));

export default useWarehouseDeletionStore;
