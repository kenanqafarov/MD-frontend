// src/api/warehouse-removals.js
import axiosInstance from "./temp-axios-auth"; // Bu yolun düzgün olduğuna əmin olun!

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Searches for warehouse removal records based on provided criteria.
 * @param {object} searchParams - The search criteria.
 * @param {string} [searchParams.date] - Filter by date (e.g., "YYYY-MM-DD").
 * @param {string} [searchParams.time] - Filter by time (e.g., "HH:mm:ss").
 * @returns {Promise<Array<object>>} A list of matching warehouse removal records.
 */
export const searchWarehouseRemovals = async (searchParams) => {
  try {
    const transformedParams = {};
    for (const key in searchParams) {
      if (
        searchParams[key] !== undefined &&
        searchParams[key] !== null &&
        searchParams[key] !== ""
      ) {
        // Time is expected as "HH:mm:ss" string by backend
        transformedParams[key] = searchParams[key];
      }
    }

    console.log("Searching warehouse removals with parameters:", JSON.stringify(transformedParams, null, 2));
    const response = await axiosInstance.post(
      `${API_BASE_URL}/warehouse-removal/search`,
      transformedParams
    );
    console.log("Warehouse removal search results received:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error searching warehouse removals:", error);
    if (error.response) {
      console.error("Search error response data:", error.response.data);
      console.error("Search error response status:", error.response.status);
    } else if (error.request) {
      console.error("Error request:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    throw error;
  }
};

/**
 * Reads all warehouse removal records.
 * @returns {Promise<Array<object>>} A list of all warehouse removal records.
 */
export const readAllWarehouseRemovals = async () => {
  try {
    console.log("Reading all warehouse removals...");
    const response = await axiosInstance.get(`${API_BASE_URL}/warehouse-removal/read`);
    console.log("All warehouse removals received:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error reading all warehouse removals:", error);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
    } else if (error.request) {
      console.error("Error request:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    throw error;
  }
};

/**
 * Gets detailed information for a specific warehouse removal record by ID.
 * @param {number} id - The ID of the warehouse removal record.
 * @returns {Promise<object>} Detailed warehouse removal information.
 */
export const getWarehouseRemovalInfo = async (id) => {
  try {
    console.log(`Fetching warehouse removal info for ID: ${id}`);
    const response = await axiosInstance.get(
      `${API_BASE_URL}/warehouse-removal/info/${id}`
    );
    console.log("Warehouse removal info received:", response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error getting warehouse removal info for ID ${id}:`, error);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
    } else if (error.request) {
      console.error("Error request:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    throw error;
  }
};