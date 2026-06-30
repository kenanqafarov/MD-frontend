import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import OrderForm from "../../components/OrderForm";
import useDentalOrderStore from "../../../stores/dentalOrderStore";

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentOrder, fetchOrderById, loading } = useDentalOrderStore();

    useEffect(() => {
        if (id) {
            fetchOrderById(id);
        }
    }, [id, fetchOrderById]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Yüklənir...</div>;
    }

    if (!currentOrder) {
        return <div className="flex justify-center items-center h-screen">Sifariş tapılmadı</div>;
    }

    return (
        <div className="w-full h-full flex flex-col p-4 bg-gray-50">
            <h1 className="text-2xl font-bold mb-4">Sifariş Detalları #{id}</h1>
            <OrderForm 
                initialData={currentOrder} 
                mode="view" 
                onCancel={() => navigate(-1)} 
            />
        </div>
    );
};

export default OrderDetail;
