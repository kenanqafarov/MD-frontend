import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Patient treatment yaratmaq üçün API çağırışı
 * @param {Object} data - Request body
 * @param {string} data.planMainId - Plan main ID
 * @param {Array} data.patientPlansRequests - Patient plans requests array
 * @param {string} data.patientPlansRequests[].planId - Plan ID
 * @param {boolean} data.patientPlansRequests[].isChecked - Is checked
 * @returns {Promise} API response
 */
export const createPatientTreatment = async (data) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/patient-treatment/create`,
    data
  );
  return {
    success: true,
    status: response.status,
    data: response.data,
  };
};

/**
 * Patient treatment save etmək üçün API çağırışı
 * @param {Object} data - Request body
 * @param {Array<string>} data.checkedPlanIds - Checked plan IDs array
 * @returns {Promise} API response
 */
export const savePatientTreatment = async (data) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/patient-treatment/save`,
    data
  );
  return {
    success: true,
    status: response.status,
    data: response.data,
  };
};

/**
 * Patient treatment oxumaq üçün plan main ID-yə görə API çağırışı
 * @param {string} planMainId - Plan main ID
 * @returns {Promise} API response
 */
export const readPatientTreatmentByPlanMainId = async (planMainId) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/patient-treatment/read-by-plan-main-id-of-treatment/${planMainId}`
  );
  return {
    success: true,
    status: response.status,
    data: response.data,
  };
};

/**
 * Patient treatment oxumaq üçün plan main ID-yə görə kateqoriya və əməliyyatları oxumaq
 * @param {string} planMainId - Plan main ID
 * @returns {Promise} API response
 */
export const readCategoryAndOperationsByPlanMainId = async (planMainId) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/patient-treatment/read-by-category-of-plan-main/${planMainId}`
  );
  return {
    success: true,
    status: response.status,
    data: response.data,
  };
};

