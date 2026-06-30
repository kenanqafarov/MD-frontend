import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// ✔ Create
export const createAppointmentType = async (data) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/appointment-type/create`,
    data
  );
  return response.data;
};

// ✔ Update
export const updateAppointmentType = async (data) => {
  const response = await axiosInstance.put(
    `${API_BASE_URL}/appointment-type/update`,
    data
  );
  return response.data;
};

// ✔ Update status
export const updateAppointmentTypeStatus = async (statusData) => {
  const response = await axiosInstance.put(
    `${API_BASE_URL}/appointment-type/status-updated`,
    statusData
  );
  return response.data;
};

// ✔ Search
export const searchAppointmentTypes = async (params) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/appointment-type/search`,
    params
  );
  return response.data;
};

// ✔ Read all
export const readAppointmentTypes = async () => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/appointment-type/read`
  );
  return response.data;
};

// ✔ Delete
export const deleteAppointmentType = async (id) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/appointment-type/delete/${id}`
  );
  return response.data;
};
