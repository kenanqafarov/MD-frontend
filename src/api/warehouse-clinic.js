// src/services/warehouseService.js
import axiosInstance from '../api/temp-axios-auth';

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const warehouseClinic = {
  searchWarehouse: async (searchPayload) => {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}/warehouse/search-warehouse`,
        searchPayload
      );
      return response.data;
    } catch (error) {
      console.error('Error searching warehouse:', error);
      throw error;
    }
  },

  readWarehouse: async () => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/warehouse/read-warehouse`
      );
      return response.data;
    } catch (error) {
      console.error('Error reading warehouse:', error);
      throw error;
    }
  },
};

export default warehouseClinic;
