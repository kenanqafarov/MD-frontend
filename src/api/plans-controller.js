import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}`;

export const createPlans = async (data) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/permission/create`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Plan yaratmaqda xəta:", error);
    throw error;
  }
};
export const fetchPlans = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/patient-plans-main/read`);
    return response.data;
  } catch (error) {
    console.error("Planları oxumaqda xəta:", error);
    throw error;
  }
};

export const fetchPermissionById = async (id) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/permission/info/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(`Planda xeta ${id}`, error);
    throw error;
  }
};
export const updatePlans = async (data) => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/patient-plans-main/update`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Plan yenilənməsində xəta:", error);
    throw error;
  }
};


export const deletePlans = async (id) => {
  try {
    const response = await axiosInstance.delete(
      `${API_BASE_URL}/patient-plans-main/delete/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(`Plan silinməsində xəta (ID: ${id}):`, error);
    throw error;
  }
};

