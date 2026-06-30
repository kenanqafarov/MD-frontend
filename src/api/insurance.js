import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// ✔ Create
export const createInsuranceCompany = async (data) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/insurance-company/create`,
    data
  );
  return response.data;
};

// ✔ Update
export const updateInsuranceCompany = async (id, data) => {
  const response = await axiosInstance.put(
    `${API_BASE_URL}/insurance-company/update/${id}`,
    data
  );
  return response.data;
};

// ✔ Update status
export const updateInsuranceCompanyStatus = async (id, statusData) => {
  const response = await axiosInstance.patch(
    `${API_BASE_URL}/insurance-company/update/status/${id}`,
    statusData
  );
  return response.data;
};

// ✔ Search
export const searchInsuranceCompany = async (params) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/insurance-company/search`,
    {
      params,
    }
  );
  return response.data;
};

// ✔ Read all
export const readInsuranceCompany = async () => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/insurance-company/read`
  );
  return response.data;
};

// ✔ Read list (for dropdowns, light fetch)
export const readInsuranceCompanyList = async () => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/insurance-company/read-list`
  );
  return response.data;
};

// ✔ Read by ID
export const readInsuranceCompanyById = async (id) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/insurance-company/read-by-id/${id}`
  );
  return response.data;
};

// ✔ Export to Excel
export const exportInsuranceCompanyToExcel = async () => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/insurance-company/export/excel`,
    {
      responseType: "blob",
    }
  );
  return response.data;
};

// ✔ Delete
export const deleteInsuranceCompany = async (id) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/insurance-company/delete/${id}`
  );
  return response.data;
};
