import { create } from "zustand";
import {
  createPatientRecipe,
  getPatientRecipes,
  updatePatientRecipe,
  deletePatientRecipe,
} from "../src/api/patient-recipes";

const usePatientRecipeStore = create((set) => ({
  recipes: [],
  loading: false,
  error: null,

  fetchRecipes: async (patientId) => {
    set({ loading: true, error: null });
    try {
      const response = await getPatientRecipes(patientId);
      set({ recipes: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  createRecipe: async (data) => {
    set({ loading: true, error: null });
    try {
      await createPatientRecipe(data);
      await usePatientRecipeStore.getState().fetchRecipes();
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  updateRecipe: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await updatePatientRecipe(id, data);
      await usePatientRecipeStore.getState().fetchRecipes();
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  deleteRecipe: async (id) => {
    set({ loading: true, error: null });
    try {
      await deletePatientRecipe(id);
      await usePatientRecipeStore.getState().fetchRecipes();
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
}));

export default usePatientRecipeStore;
