import React from "react";
import { useNavigate } from "react-router-dom";
import OrderForm from "../components/OrderForm";

const AddOrder = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full h-full flex flex-col">
           <OrderForm onSubmit={() => navigate("/received-orders")} />
        </div>
    );
}

export default AddOrder;