import React, { useEffect, useState } from "react";
import StockDeleteForm from "../../components/StockDeleteForm.jsx";
import { useNavigate, useParams } from "react-router-dom";
import useWarehouseDeletionStore from "../../../stores/warehouseDeletionStore.js";

const StockDeleteDetail = ({ mode }) => {
  const currentMode = mode || "view";
  const navigate = useNavigate();
  const { id } = useParams();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    fetchDeletionById,
    updateDeletion,
    selectedDeletion,
    loading: storeLoading,
    error,
  } = useWarehouseDeletionStore();

  useEffect(() => {
    if (id) {
      fetchDeletionById(id);
    } else {
      setLoading(false);
    }
  }, [id, fetchDeletionById]);

  useEffect(() => {
    if (selectedDeletion) {
      // API-dən gələn məlumatı formata uyğunlaşdır
      const products = selectedDeletion.deletionFromWarehouseProductResponses || selectedDeletion.products || [];
      
      // Saatı input[type=time] formatına çevir
      let timeValue = "00:00";
      if (selectedDeletion.time) {
        if (typeof selectedDeletion.time === "string") {
          timeValue = selectedDeletion.time.substring(0, 5);
        } else if (selectedDeletion.time.hour !== undefined) {
          timeValue = `${selectedDeletion.time.hour
            .toString()
            .padStart(2, "0")}:${selectedDeletion.time.minute
            .toString()
            .padStart(2, "0")}`;
        }
      }

      const formattedData = {
        orderDate: selectedDeletion.date,
        orderTime: timeValue,
        note: selectedDeletion.description || "",
        products: products.map((product) => ({
          warehouseEntryId: product.warehouseEntryId,
          warehouseEntryProductId: product.warehouseEntryProductId,
          productId: product.productId,
          categoryId: product.categoryId,
          quantity: product.quantity,
          productName: product.productName || "Naməlum",
          categoryName: product.categoryName || "Naməlum",
          availableQuantity: product.availableQuantity || 0,
        })),
      };
      setInitialData(formattedData);
      setLoading(false);
    }
  }, [selectedDeletion, mode]);

  const handleSubmit = async (formData) => {
    try {
      if (mode === "edit") {
        await updateDeletion(formData);
      }
      // After successful submission, navigate back to the list view
      navigate("/stock/delete");
    } catch (err) {
      console.error("Form göndərilərkən xəta baş verdi:", err);
    }
  };

  const handleCancel = () => {
    navigate("/stock/delete");
  };

  if ((currentMode === "edit" && loading) || storeLoading) {
    return <div>Yüklənir...</div>;
  }

  if (error && currentMode === "edit") {
    return <div>Xəta: {error}</div>;
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl min-h-screen border border-gray-200 rounded-lg p-4 bg-white">
        <h1 className="text-2xl font-bold mb-4">
          {currentMode === "edit" ? "Məhsul Silinməsinə Düzəliş" : currentMode === "view" ? "Anbar Silinmə Detalları" : "Məhsul Sil"}
        </h1>
        <StockDeleteForm
          initialData={initialData}
          mode={currentMode}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default StockDeleteDetail;