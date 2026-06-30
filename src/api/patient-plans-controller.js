import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// ✔ read category and operation items
export const readCategoryAndOperationItems = async (id) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/patient-plans/read-category-and-operations/${id}`
  );
  return response.data;
};


export const createPatientPlan = async (data) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/patient-plans/create`,
    data
  );
  return response.data;
};

// Read patient plans
export const readPatientPlans = async (id) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/patient-plans/read-by-patient-plan-main/${id}`
    );
  return response.data;
};

// Delete patient plan item
export const deletePatientPlanItem = async (id) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/patient-plans/delete/${id}`
  );
  return response.data;
};

// Save/Confirm patient plan
export const savePatientPlan = async (id) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/patient-plans-main/save/${id}`
  );
  return response.data;
};