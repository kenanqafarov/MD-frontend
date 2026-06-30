// src/api/patient-recipe.js
import axiosInstance from "./temp-axios-auth"; // Make sure this path is correct

const API_BASE_URL = import.meta.env.VITE_BASE_URL; // Your base API URL from .env

export const createPatientRecipe = async (recipeData) => {
  try {
    console.log(
      "Creating patient recipe with data:",
      JSON.stringify(recipeData, null, 2)
    );
    const response = await axiosInstance.post(
      `${API_BASE_URL}/patient-recipes/create`,
      recipeData
    );
    console.log("Patient recipe created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating patient recipe:", error);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
    } else if (error.request) {
      console.error("Error request:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    throw error;
  }
};

export const readPatientRecipes = async (patientId) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/patient-recipes/read`,
      {
        params: {
          patientId: patientId,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error reading patient recipes:", error);
    throw error;
  }
};

export const updatePatientRecipe = async (id, recipeData) => {
  console.log("🔧 Updating patient recipe with ID:", id, "Data:", recipeData);
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/patient-recipes/update/${id}`,
      recipeData
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error updating patient recipe with ID ${id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

export const deletePatientRecipe = async (id) => {
  try {
    console.log("Attempting to delete patient recipe with id:", id);
    const response = await axiosInstance.delete(
      `${API_BASE_URL}/patient-recipes/delete/${id}`
    );
    if (response.status === 200) {
      console.log("✅ Patient recipe deleted successfully");
    } else {
      console.error("❌ Patient recipe deletion failed:", response);
    }
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error deleting patient recipe:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const readSingleRecipeById = async (id) => {
  try {
    // This is the specific API call for GET /recipe/read-by-id with query parameter
    const response = await axiosInstance.get(
      `${API_BASE_URL}/recipe/read-by-id`,
      {
        params: {
          id: id,
        },
      }
    );
    // Assuming the API returns the recipe object directly in response.data,
    // and that object contains a 'name' field (e.g., { id: 1, name: "Recipe A", ... }).
    // If the field for the name is different (e.g., 'recipeName'), you'll adjust in the store.
    return response.data;
  } catch (error) {
    console.error(`Error reading single recipe with ID ${id}:`, error);
    throw error;
  }
};