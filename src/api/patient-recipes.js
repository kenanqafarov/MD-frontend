import axiosInstance from "./temp-axios-auth";

const BASE_URL = import.meta.env.VITE_BASE_URL + "/patient-recipes";

// CREATE - POST
export const createPatientRecipe = async (data) => {
  return await axiosInstance.post(`${BASE_URL}/create`, data);
};

// READ - GET
export const getPatientRecipes = async (patientId) => {
  return await axiosInstance.get(`${BASE_URL}/read`, {
    params: { patientId },
  });
};

// UPDATE - PUT
export const updatePatientRecipe = async (id, data) => {
  return await axiosInstance.put(`${BASE_URL}/update/${id}`, data);
};

// DELETE - DELETE
export const deletePatientRecipe = async (id) => {
  return await axiosInstance.delete(`${BASE_URL}/delete/${id}`);
};
