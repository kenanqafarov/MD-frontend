import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SimpleList from "../../components/list/SimpleList.jsx";
import useWarehouseRemovalProductsStore from "../../../stores/warehouseRemovalProductsStore";

const ProductUsageDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { 
        selectedProductDetails, 
        fetchProductDetails, 
        loading, 
        error,
        clearSelectedProductDetails
    } = useWarehouseRemovalProductsStore();

    useEffect(() => {
        if (id) {
            fetchProductDetails(id);
        }
        return () => clearSelectedProductDetails();
    }, [id, fetchProductDetails, clearSelectedProductDetails]);

    if (loading) return <div className="text-center py-10">Yüklənir...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
    if (!selectedProductDetails) return null;

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
            key: "quantity",
            label: "Miqdar"
        }
    ];

    // Details are usually a single product or a group
    const data = [selectedProductDetails];

    return (
        <div className="flex flex-col border border-gray-200 rounded-lg p-6 bg-white min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Məhsul istifadəsi Detalları</h1>
                <button 
                    onClick={() => navigate("/stock/usage")}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                    Geri qayıt
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                    <label className="text-sm text-gray-500">Tarix</label>
                    <p className="text-lg font-medium">{selectedProductDetails.date || "-"}</p>
                </div>
                <div>
                    <label className="text-sm text-gray-500">Saat</label>
                    <p className="text-lg font-medium">{selectedProductDetails.time || "-"}</p>
                </div>
                <div>
                    <label className="text-sm text-gray-500">Status</label>
                    <p className="text-lg font-medium">{selectedProductDetails.pendingStatus || "-"}</p>
                </div>
                <div>
                    <label className="text-sm text-gray-500">Nömrə</label>
                    <p className="text-lg font-medium">{selectedProductDetails.number || "-"}</p>
                </div>
            </div>

            <div className="mt-4">
                <h3 className="text-xl font-semibold mb-3">Məhsul</h3>
                <SimpleList
                    columns={columns}
                    data={data}
                    pagination={false}
                />
            </div>
        </div>
    );
};

export default ProductUsageDetail;