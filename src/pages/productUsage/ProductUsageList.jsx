import React, { useEffect } from "react";
import SearchIcon from "../../assets/icons/Search";
import CustomDropdown from "../../components/CustomDropdown";
import DownloadIcon from "../../assets/icons/Download";
import { useNavigate } from "react-router-dom";
import SimpleList from "../../components/list/SimpleList";
import useWarehouseRemovalProductsStore from "../../../stores/warehouseRemovalProductsStore";

const ProductUsageList = () => {
    const navigate = useNavigate();
    const { 
        products, 
        loading, 
        error, 
        fetchAllProducts, 
        searchTerm, 
        setSearchTerm, 
        fetchProductsBySearch 
    } = useWarehouseRemovalProductsStore();

    useEffect(() => {
        fetchAllProducts();
    }, [fetchAllProducts]);

    const columns = [
        {
            key: "categoryName",
            label: "Kategoriyası"
        },
        {   
            key: "productName",
            label: "Məhsulun adı"
        },
        {
            key: "idNumber",
            label: "Məhsulun kodu"
        },
        {
            key: "quantity",
            label: "Məhsulun Sayı"
        },
        {
            key: "pendingStatus",
            label: "Status"
        }
    ];

    const handleSearch = () => {
        if (searchTerm) {
            fetchProductsBySearch();
        } else {
            fetchAllProducts();
        }
    };

    if (loading && products.length === 0) {
        return <div className="text-center py-10">Yüklənir...</div>;
    }

    return (
        <div className="flex flex-col border border-gray-200 rounded-lg bg-white p-1 min-h-screen">
            <div className="flex justify-between items-center gap-2 p-2">
                <div className="flex items-center gap-2">               
                    <CustomDropdown />
                    <input 
                        type="text" 
                        placeholder="Axtarış..." 
                        className="w-full p-2 rounded-lg border border-gray-300" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button className="" onClick={handleSearch}>
                        <SearchIcon />
                    </button>
                </div>
                <div className="flex items-center gap-8">
                    <button className="">
                        <DownloadIcon />
                    </button>
                </div>
            </div>

            {error && <div className="text-red-500 p-2">{error}</div>}

            <SimpleList
                columns={columns} 
                data={products} 
                enableView={true} 
                handleView={(id) => {navigate("/stock/usage/" + id)}}
            />
        </div>
    );
};

export default ProductUsageList;