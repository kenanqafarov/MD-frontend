import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}`;

export const createPermission = async (data) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/permission/create`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Permission yaratmaqda xəta:", error);
    throw error;
  }
};
export const fetchPermissions = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/permission/read`);
    return response.data;
  } catch (error) {
    console.error("İcazələri oxumaqda xəta:", error);
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
    console.error(`ID ilə icazə tapılmadı: ${id}`, error);
    throw error;
  }
};
export const updatePermission = async (data) => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/permission/update`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Permission yenilənməsində xəta:", error);
    throw error;
  }
};
export const updatePermissionStatus = async (data) => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/permission/status-updated`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Permission status yenilənməsində xəta:", error);
    throw error;
  }
};
export const searchPermissions = async (criteria) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/permission/search`,
      criteria
    );
    return response.data;
  } catch (error) {
    console.error("Permission axtarışında xəta:", error);
    throw error;
  }
};
export const deletePermission = async (id) => {
  try {
    const response = await axiosInstance.delete(
      `${API_BASE_URL}/permission/delete/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(`Permission silinməsində xəta (ID: ${id}):`, error);
    throw error;
  }
};

