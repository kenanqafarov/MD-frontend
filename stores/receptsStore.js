import { create } from "zustand";
import {
  readAllRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  readRecipeById,
  updateRecipeStatus,
  searchRecipes,
  exportRecipeExcel,
  readRecipeList, // Yeni API funksiyasını import edirik
} from "../src/api/recepts"; // Yolu düzgünlüyündən əmin olun

const useRecipeStore = create((set) => ({
  recipes: [],
  recipeListOptions: [], // Sadələşdirilmiş reseptlər siyahısı üçün yeni state
  selectedRecipe: null,
  loading: false,
  error: null,

  fetchRecipes: async () => {
    set({ loading: true, error: null });
    try {
      const data = await readAllRecipes();
      set({ recipes: data.data || [], loading: false }); // Fərz olunur ki, data.data massivi saxlayır
    } catch (err) {
      set({ error: err, loading: false });
      console.error("Bütün reseptləri yükləmək alınmadı:", err);
    }
  },

  fetchRecipeList: async () => {
    set({ loading: true, error: null });
    try {
      const data = await readRecipeList();
      // API-dən gələn `id` və `name` formatını `value` və `label` formatına çeviririk
      const formattedOptions = data.map(item => ({
          value: item.id,   // Reseptin ID-si olacaq
          label: item.name  // Reseptin adı olacaq
      }));
      set({ recipeListOptions: formattedOptions || [], loading: false });
    } catch (err) {
      set({ error: err, loading: false });
      console.error("Dropdown üçün resept siyahısını yükləmək alınmadı:", err);
    }
  },

  fetchRecipeById: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await readRecipeById(id);
      set({ selectedRecipe: data, loading: false });
    } catch (err) {
      set({ error: err, loading: false });
      console.error(`ID-si ${id} olan resepti yükləmək alınmadı:`, err);
    }
  },

  createNewRecipe: async (recipeData) => {
    set({ loading: true, error: null });
    try {
      await createRecipe(recipeData);
      await useRecipeStore.getState().fetchRecipes();
      await useRecipeStore.getState().fetchRecipeList(); // Yeni resept yaradıldıqda dropdown siyahısını yeniləyin
    } catch (err) {
      set({ error: err, loading: false });
      console.error("Yeni resept yaratmaq alınmadı:", err);
    }
  },

  updateRecipeById: async (id, recipeData) => {
    set({ loading: true, error: null });
    try {
      await updateRecipe(id, recipeData);
      await useRecipeStore.getState().fetchRecipes();
      await useRecipeStore.getState().fetchRecipeList(); // Resept adı/ID yeniləndikdə dropdown siyahısını yeniləyin
    } catch (err) {
      set({ error: err, loading: false });
      console.error(`ID-si ${id} olan resepti yeniləmək alınmadı:`, err);
    }
  },

  updateStatus: async (id, statusData) => {
    set({ loading: true, error: null });
    try {
      await updateRecipeStatus(id, statusData);
      await useRecipeStore.getState().fetchRecipes();
    } catch (err) {
      set({ error: err, loading: false });
      console.error(`ID-si ${id} olan reseptin statusunu yeniləmək alınmadı:`, err);
    }
  },

  deleteRecipeById: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteRecipe(id);
      await useRecipeStore.getState().fetchRecipes();
      await useRecipeStore.getState().fetchRecipeList(); // Silindikdən sonra dropdown siyahısını yeniləyin
    } catch (err) {
      set({ error: err, loading: false });
      console.error(`ID-si ${id} olan resepti silmək alınmadı:`, err);
    }
  },

  searchRecipeList: async (params) => {
    set({ loading: true, error: null });
    try {
      const result = await searchRecipes(params);
      set({ recipes: result.data || [], loading: false });
    } catch (err) {
      set({ error: err, loading: false });
      console.error("Reseptləri axtarmaq alınmadı:", err);
    }
  },

  exportExcel: async () => {
    set({ loading: true, error: null });
    try {
      const blob = await exportRecipeExcel();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "recipes.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      set({ loading: false });
    } catch (err) {
      console.error("Excel export xətası:", err);
      set({ error: err, loading: false });
    }
  },
}));

export default useRecipeStore;