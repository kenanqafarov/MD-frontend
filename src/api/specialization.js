// src/api/specialization.js
import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

export const createSpecialization = async (specializationData) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/specialization/create`,
      specializationData
    );
    console.log("Specialization created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating specialization:", error);
    throw error;
  }
};

export const readSpecializations = async () => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/specialization/read`
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error reading specializations:", error);
    throw error;
  }
};

export const updateSpecialization = async (specializationData) => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/specialization/update`,
      specializationData
    );
    console.log("Specialization updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating specialization:", error);
    throw error;
  }
};

export const deleteSpecialization = async (id) => {
  try {
    const response = await axiosInstance.delete(
      `${API_BASE_URL}/specialization/delete/${id}`
    );
    console.log(`Specialization with id ${id} deleted successfully.`);
    return response.data;
  } catch (error) {
    console.error(
      `❌ Error deleting specialization with id ${id}:`,
      error
    );
    throw error;
  }
};