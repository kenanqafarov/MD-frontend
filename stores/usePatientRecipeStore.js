// stores/usePatientRecipeStore.js
import { create } from "zustand";
import { toast } from "react-toastify"; // Import toast for notifications

import {
  createPatientRecipe,
  readPatientRecipes,
  updatePatientRecipe,
  deletePatientRecipe,
  readSingleRecipeById,
} from "../src/api/patient-recipe"; // Ensure this path is correct

const usePatientRecipeStore = create((set, get) => ({
  patientRecipes: [],
  selectedPatientRecipe: null,
  loading: false,
  error: null,
  recipeNamesCache: {}, // Cache for recipe names

  fetchPatientRecipes: async (patientId) => {
    set({ loading: true, error: null });
    try {
      if (!patientId) {
        throw new Error("Patient ID is required to fetch recipes.");
      }
      const data = await readPatientRecipes(patientId);
      set({ patientRecipes: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Failed to fetch patient recipes:", err);
      toast.error("Reseptlər yüklənərkən xəta baş verdi: " + (err.message || "Naməlum xəta"));
    }
  },

  fetchRecipeName: async (recipeId) => {
    const { recipeNamesCache } = get();
    if (recipeNamesCache[recipeId]) {
      return recipeNamesCache[recipeId]; // Return from cache if available
    }

    try {
      const data = await readSingleRecipeById(recipeId);
      // IMPORTANT: Adjust 'data.name' if your API response for a single recipe
      // uses a different key for the recipe name (e.g., data.recipeName, data.title).
      const recipeName = data ? data.name : null; 

      if (recipeName) {
        set((state) => ({
          recipeNamesCache: {
            ...state.recipeNamesCache,
            [recipeId]: recipeName,
          },
        }));
      }
      return recipeName;
    } catch (err) {
      console.error(`Failed to fetch recipe name for ID ${recipeId}:`, err);
      // Do not show a toast for this specific error to avoid spamming,
      // as it might be called for many recipes. The UI fallback `Resept ${recipe.recipeId}` is sufficient.
      return null;
    }
  },

  addPatientRecipe: async (recipeData) => {
    set({ loading: true, error: null });
    try {
      await createPatientRecipe(recipeData);
      if (recipeData.patientId) {
        await get().fetchPatientRecipes(recipeData.patientId);
        // If the API for `createPatientRecipe` returns the full recipe object with `recipeName`,
        // you can use it here to update the cache directly.
        // Assuming `recipeData` already contains `recipeId` and `recipeName` when adding.
        if (recipeData.recipeId && recipeData.recipeName) {
          set((state) => ({
            recipeNamesCache: {
              ...state.recipeNamesCache,
              [recipeData.recipeId]: recipeData.recipeName,
            },
          }));
        }
      } else {
        console.warn("Patient ID missing in recipeData for refreshing list after add.");
      }
      toast.success("Resept uğurla əlavə edildi!");
    } catch (err) {
      set({ error: err.message, loading: false });
      toast.error(
        "Resept əlavə edilərkən xəta baş verdi: " +
          (err.message || "Naməlum xəta")
      );
      throw err;
    }
  },

  editPatientRecipe: async (id, recipeData) => {
    set({ loading: true, error: null });
    try {
      await updatePatientRecipe(id, recipeData);
      if (recipeData.patientId) {
        await get().fetchPatientRecipes(recipeData.patientId);
        // Update cache for the edited recipe name if available in recipeData
        if (recipeData.recipeId && recipeData.recipeName) {
          set((state) => ({
            recipeNamesCache: {
              ...state.recipeNamesCache,
              [recipeData.recipeId]: recipeData.recipeName,
            },
          }));
        }
      } else {
        console.warn("Patient ID missing in recipeData for refreshing list after edit.");
      }
      toast.success("Resept uğurla yeniləndi!");
    } catch (err) {
      set({ error: err.message, loading: false });
      toast.error(
        "Resept yenilənərkən xəta baş verdi: " + (err.message || "Naməlum xəta")
      );
      throw err;
    }
  },

  removePatientRecipe: async (id, patientId) => {
    set({ loading: true, error: null });
    try {
      await deletePatientRecipe(id);
      if (patientId) {
        await get().fetchPatientRecipes(patientId);
        // Remove the deleted patient recipe's associated recipe name from cache
        set((state) => {
          const newCache = { ...state.recipeNamesCache };
          // The 'id' here is the patientRecipe.id, not necessarily the recipe content's ID.
          // If a patientRecipe has a specific recipeId, you might want to clear that from cache.
          // For simplicity, we assume `id` could sometimes be the key in `recipeNamesCache` if directly related.
          // If not, you might need to find the recipe in `patientRecipes` first to get its `recipeId` before deleting from cache.
          // For now, this line might need adjustment based on how `recipeNamesCache` is keyed.
          // If `recipeNamesCache` uses `recipeId` as key, you'd need the `recipeId` of the deleted item.
          // A safer approach might be to refetch names or rely on `fetchMissingRecipeNames` later.
          // As given, `delete newCache[id]` clears a cache entry where key is `patientRecipe.id`.
          delete newCache[id]; 
          return { recipeNamesCache: newCache };
        });
      } else {
        console.warn("Patient ID not provided for refreshing recipes after deletion.");
      }
      toast.success("Resept uğurla silindi!");
    } catch (err) {
      set({ error: err.message, loading: false });
      toast.error(
        "Resept silinərkən xəta baş verdi: " + (err.message || "Naməlum xəta")
      );
      throw err;
    }
  },

  setSelectedPatientRecipe: (recipe) => set({ selectedPatientRecipe: recipe }),
}));

export default usePatientRecipeStore;