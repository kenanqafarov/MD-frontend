import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

export const createTechnician = async (data) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/technician/create`,
    data
  );
  return response.data;
};

export const searchTechnicians = async (searchParams) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/technician/search`,
    searchParams
  );
  return response.data;
};

export const updateTechnician = async (id, data) => {
  if (data.birthDate) {
    data.dateOfBirth = data.birthDate;
    delete data.birthDate;
  }

  Object.keys(data).forEach((key) => {
    if (data[key] === "" || data[key] === undefined || data[key] === null) {
      delete data[key];
    }
  });

  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/technician/update/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Update error:", error.response?.data || error.message);
    throw error;
  }
};

export const updateTechnicianStatus = async (id, status) => {
  const response = await axiosInstance.patch(
    `${API_BASE_URL}/technician/update/status/${id}`,
    { status }
  );
  return response.data;
};

export const getAllTechnicians = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/technician/read`);
  return response.data;
};

export const getTechnicianById = async (id) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/technician/read-by-id/${id}`
  );
  return response.data;
};

export const exportTechniciansToExcel = async () => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/technician/export/excel`,
    {
      responseType: "blob", // Excel faylı üçün vacibdir
    }
  );
  return response.data;
};

export const deleteTechnician = async (id) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/technician/delete/${id}`
  );
  return response.data;
};
