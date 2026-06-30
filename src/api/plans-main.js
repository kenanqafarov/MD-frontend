import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}`;

export const createPlans = async (newData) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/patient-plans-main/create`,
      newData
    );
    return response; // Response objesini döndür ki status kontrolü yapılabilsin
  } catch (error) {
    console.error("Plan yaratmaqda xəta:", error);
    throw error;
  }
};
export const fetchPlans = async (patientId) => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/patient-plans-main/read/${patientId}`);
    return response;
  } catch (error) {
    console.error("Planları oxumaqda xəta:", error);
    throw error;
  }
};

export const updatePlans = async (data) => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/patient-plans-main/update`,
      data
    );
    return response; // Response objesini döndür ki status kontrolü yapılabilsin
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
    return response; // Response objesini döndür ki status kontrolü yapılabilsin
  } catch (error) {
    console.error(`Plan silinməsində xəta (ID: ${id}):`, error);
    throw error;
  }
};

