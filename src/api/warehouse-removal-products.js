import axiosInstance from "./temp-axios-auth";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

export const createWarehouseRemovalProduct = async (data) => {
    try {
        const formattedData = {
            ...data,
            time: data.time && data.time.length === 5 ? `${data.time}:00` : data.time,
        };
        console.log("Creating warehouse removal product with data:", JSON.stringify(formattedData, null, 2));
        const response = await axiosInstance.post(
            `${API_BASE_URL}/warehouse-removal-product/create`,
            formattedData
        );
        console.log("Warehouse removal product created successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error creating warehouse removal product:", error);
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

export const updateWarehouseRemovalProduct = async (data) => {
    try {
        const formattedData = {
            ...data,
            time: data.time && data.time.length === 5 ? `${data.time}:00` : data.time,
        };
        console.log("Updating warehouse removal product with data:", JSON.stringify(formattedData, null, 2));
        const response = await axiosInstance.put(
            `${API_BASE_URL}/warehouse-removal-product/update`,
            formattedData
        );
        console.log("Warehouse removal product updated successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error updating warehouse removal product:", error);
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

export const searchWarehouseRemovalProducts = async (searchParams) => {
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

        console.log("Searching warehouse removal products with parameters:", JSON.stringify(transformedParams, null, 2));
        const response = await axiosInstance.post(
            `${API_BASE_URL}/warehouse-removal-product/search`,
            transformedParams
        );
        console.log("Warehouse removal product search results received:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error searching warehouse removal products:", error);
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

export const readAllWarehouseRemovalProducts = async () => {
    try {
        console.log("Reading all warehouse removal products...");
        const response = await axiosInstance.get(`${API_BASE_URL}/warehouse-removal-product/read`);
        console.log("All warehouse removal products received:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error reading all warehouse removal products:", error);
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

export const getWarehouseRemovalProductInfo = async (groupId) => {
    try {
        console.log(`Fetching warehouse removal product info for groupId: ${groupId}`);
        const response = await axiosInstance.get(
            `${API_BASE_URL}/warehouse-removal-product/info/${groupId}`
        );
        console.log("Warehouse removal product info received:", response.data);
        return response.data;
    } catch (error) {
        console.error(`❌ Error getting warehouse removal product info for groupId ${groupId}:`, error);
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