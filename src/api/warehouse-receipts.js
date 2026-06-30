// src/api/warehouse-receipts.js
import axiosInstance from "./temp-axios-auth"; // Bu yolun düzgün olduğuna əmin olun!

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Updates the pending status of a warehouse receipt.
 * @param {object} data - The request body containing id and status.
 * @param {number} data.id - The ID of the warehouse receipt.
 * @param {string} data.status - The new status (e.g., "WAITING", "APPROVED", "REJECTED").
 * @returns {Promise<object>} The updated warehouse receipt data.
 */
export const updateWarehouseReceiptPendingStatus = async (data) => {
  try {
    console.log("Updating warehouse receipt status with data:", JSON.stringify(data, null, 2));
    const response = await axiosInstance.put(
      `${API_BASE_URL}/warehouse-receipts/pending-status-updated`,
      data
    );
    console.log("Warehouse receipt status updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating warehouse receipt status:", error);
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
 * Searches for warehouse receipts based on provided criteria.
 * @param {object} searchParams - The search criteria.
 * @param {string} [searchParams.pendingStatus] - Filter by pending status (e.g., "WAITING").
 * @param {string} [searchParams.date] - Filter by date (e.g., "YYYY-MM-DD").
 * @param {string} [searchParams.time] - Filter by time (e.g., "HH:mm:ss").
 * @returns {Promise<Array<object>>} A list of matching warehouse receipts.
 */
export const searchWarehouseReceipts = async (searchParams) => {
  try {
    const transformedParams = {};
    for (const key in searchParams) {
      if (
        searchParams[key] !== undefined &&
        searchParams[key] !== null &&
        searchParams[key] !== ""
      ) {
        transformedParams[key] = searchParams[key];
      }
    }

    console.log("Searching warehouse receipts with parameters:", JSON.stringify(transformedParams, null, 2));
    const response = await axiosInstance.post(
      `${API_BASE_URL}/warehouse-receipts/search`,
      transformedParams
    );
    console.log("Warehouse receipt search results received:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error searching warehouse receipts:", error);
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
 * Gets detailed information for a specific warehouse receipt by ID.
 * @param {number} id - The ID of the warehouse receipt.
 * @returns {Promise<object>} Detailed warehouse receipt information.
 */
export const getWarehouseReceiptInfo = async (id) => {
  try {
    console.log(`Fetching warehouse receipt info for ID: ${id}`);
    const response = await axiosInstance.get(
      `${API_BASE_URL}/warehouse-receipts/info/${id}`
    );
    console.log("Warehouse receipt info received:", response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error getting warehouse receipt info for ID ${id}:`, error);
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