"use client";

import React, { useEffect } from "react";
import StockEntryForm from "../../components/StockEntryForm.jsx";
import { useNavigate, useParams } from "react-router-dom";
import useWarehouseReceiptsStore from "../../../stores/warehouseReceiptsStore";

const ImportDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const mode = "view";

  const {
    selectedReceiptDetails,
    fetchReceiptDetails,
    updateReceiptStatus,
    loading,
    error,
  } = useWarehouseReceiptsStore();

  useEffect(() => {
    if (id) {
      fetchReceiptDetails(id);
    }
  }, [id, fetchReceiptDetails]);

  const handleSubmit = (formData) => {
    console.log("Form submitted:", formData);
    navigate("/stock/entry");
  };

  const handleCancel = () => {
    navigate("/stock/entry");
  };

  const handleStatusChange = (newStatus) => {
    if (!selectedReceiptDetails) return;
    updateReceiptStatus(selectedReceiptDetails.id, newStatus);
  };

  if (loading) return <div className="text-center py-4">Yüklənir...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Xəta: {error}</div>;
  if (!selectedReceiptDetails) return null;

  return (
    <div className="flex flex-col border border-gray-200 rounded-lg p-4 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Məhsul Detalları</h1>
      <StockEntryForm
        initialData={{
          orderDate: selectedReceiptDetails.date || "-",
          orderTime: selectedReceiptDetails.time || "-",
          typeCount: selectedReceiptDetails.products?.length || 0,
          note: selectedReceiptDetails.note || "",
          products: selectedReceiptDetails.products?.map((p) => ({
            id: p.id,
            category: p.categoryName,
            name: p.productName,
            quantity: p.orderQuantity,
            price: p.price,
            categoryName: p.categoryName,
            productName: p.productName,
          })) || [],
          pendingStatus: selectedReceiptDetails.pendingStatus || "WAITING",
        }}
        mode={mode}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        handleStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default ImportDetail;
