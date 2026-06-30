import { create } from 'zustand';
import {
    createWarehouseRemovalProduct,
    updateWarehouseRemovalProduct,
    searchWarehouseRemovalProducts,
    readAllWarehouseRemovalProducts,
    getWarehouseRemovalProductInfo
} from '../src/api/warehouse-removal-products'; 

const useWarehouseRemovalProductsStore = create((set, get) => ({
    products: [],
    selectedProductDetails: null,
    loading: false,
    error: null,
    searchParams: {
        date: new Date().toISOString().split('T')[0], 
        time: '00:00:00' 
    },
    searchTerm: '',

    setSearchParams: (params) => set((state) => ({
        searchParams: { ...state.searchParams, ...params }
    })),

    setSearchTerm: (term) => set({ searchTerm: term }),

    fetchAllProducts: async () => {
        set({ loading: true, error: null });
        try {
            const data = await readAllWarehouseRemovalProducts();
            set({ products: data, loading: false });
        } catch (err) {
            console.error("Failed to fetch all warehouse removal products:", err);
            set({ error: "An error occurred while fetching warehouse removal products.", loading: false });
        }
    },

    fetchProductsBySearch: async () => {
        set({ loading: true, error: null });
        try {
            const params = get().searchParams;
            const formattedParams = {
                ...params,
                time: params.time && params.time.length === 5 ? `${params.time}:00` : params.time
            };

            const data = await searchWarehouseRemovalProducts(formattedParams);

            const filteredData = data.filter(product => {
                const lowerCaseSearchTerm = get().searchTerm.toLowerCase();
                return (
                    product.id?.toString().includes(lowerCaseSearchTerm) ||
                    product.date?.includes(lowerCaseSearchTerm) ||
                    product.time?.includes(lowerCaseSearchTerm.substring(0, 5)) ||
                    product.pendingStatus?.toLowerCase().includes(lowerCaseSearchTerm) ||
                    product.number?.toString().includes(lowerCaseSearchTerm)
                );
            });
            
            set({ products: filteredData, loading: false });
        } catch (err) {
            console.error("Failed to fetch warehouse removal products by search:", err);
            set({ error: "An error occurred while searching warehouse removal products.", loading: false });
        }
    },

    fetchProductDetails: async (groupId) => {
        set({ loading: true, error: null, selectedProductDetails: null });
        try {
            const details = await getWarehouseRemovalProductInfo(groupId);
            set({ selectedProductDetails: details, loading: false });
        } catch (err) {
            console.error(`Failed to fetch details for product groupId ${groupId}:`, err);
            set({ error: `Failed to fetch details for product groupId ${groupId}.`, loading: false });
        }
    },

    createProduct: async (data) => {
        set({ loading: true, error: null });
        try {
            const newProduct = await createWarehouseRemovalProduct(data);
            get().fetchAllProducts(); 
            set({ loading: false });
            return newProduct;
        } catch (err) {
            console.error("Failed to create warehouse removal product:", err);
            set({ error: "Failed to create warehouse removal product.", loading: false });
            throw err; 
        }
    },

    updateProduct: async (data) => {
        set({ loading: true, error: null });
        try {
            const updatedProduct = await updateWarehouseRemovalProduct(data);
            get().fetchAllProducts(); 
            set({ loading: false });
            return updatedProduct;
        } catch (err) {
            console.error("Failed to update warehouse removal product:", err);
            set({ error: "Failed to update warehouse removal product.", loading: false });
            throw err; 
        }
    },

    clearSelectedProductDetails: () => set({ selectedProductDetails: null }),
}));

export default useWarehouseRemovalProductsStore;