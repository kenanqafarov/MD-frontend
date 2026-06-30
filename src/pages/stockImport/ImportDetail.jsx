import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useProductCategoryStore } from "../../../stores/productCategories";
import { useProductStore } from "../../../stores/productStore";

const ImportDetail = () => {
  const { id } = useParams();
  const { fetchCategories, categories } = useProductCategoryStore();
  const { fetchProducts, products } = useProductStore();

  const [entryData, setEntryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchCategories();
        await fetchProducts();
        await fetchEntryDetail();
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const fetchEntryDetail = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/warehouse-entry/info/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!res.ok) throw new Error("API-dən düzgün cavab gəlmədi");
      const data = await res.json();

      const transformedData = {
        id: id,
        date: data.date || "",
        time: data.time || "", 
        description: data.description || "",
        warehouseEntryProductUpdateRequests: (data.warehouseEntryProducts || []).map(
          (p) => ({
            warehouseEntryProductId: p.id,
            categoryId: p.categoryId || 0,
            productId: p.productId || 0,
            quantity: p.quantity,
            price: p.price,
          })
        ),
      };

      setEntryData(transformedData);
    } catch (err) {
      console.error("Məlumat yüklənmədi", err);
      setEntryData({ error: true });
    }
  };

  if (loading && !entryData) return <div className="p-10 text-center text-gray-500">Yüklənir...</div>;
  if (!entryData || entryData.error) return <div className="p-10 text-center text-red-500">Məlumat yüklənərkən xəta baş verdi və ya məlumat tapılmadı.</div>;

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <h2 className="text-xl font-bold mb-4">
        Anbar Giriş Məlumatları (ID: {id})
      </h2>

      <div className="mb-4">
        <label className="block mb-1">Tarix:</label>
        <input
          type="date"
          value={entryData.date}
          disabled
          className="p-2 border rounded w-full bg-gray-100"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Saat:</label>
        <input
          type="time"
          value={entryData.time ? entryData.time.slice(0, 5) : ""}
          disabled
          className="p-2 border rounded w-full bg-gray-100"
        />
      </div>

      {entryData.warehouseEntryProductUpdateRequests.map((item, index) => (
        <div key={index} className="mb-4 p-4 border rounded bg-gray-50">
          <div className="mb-2">
            <label className="block mb-1">Kategoriya:</label>
            <select
              value={item.categoryId}
              disabled
              className="p-2 border rounded w-full bg-gray-100"
            >
              <option value="">Seçin</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-2">
            <label className="block mb-1">Məhsul:</label>
            <select
              value={item.productId}
              disabled
              className="p-2 border rounded w-full bg-gray-100"
            >
              <option value="">Seçin</option>
              {products
                .filter((p) => p.categoryId === item.categoryId)
                .map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.productName}
                  </option>
                ))}
            </select>
          </div>

          <div className="mb-2">
            <label className="block mb-1">Say:</label>
            <input
              type="number"
              value={item.quantity}
              disabled
              className="p-2 border rounded w-full bg-gray-100"
            />
          </div>

          <div className="mb-2">
            <label className="block mb-1">Qiymət:</label>
            <input
              type="number"
              value={item.price}
              disabled
              className="p-2 border rounded w-full bg-gray-100"
            />
          </div>
        </div>
      ))}

      <div className="mb-4">
        <label className="block mb-1">Qeyd:</label>
        <textarea
          value={entryData.description}
          disabled
          className="p-2 border rounded w-full bg-gray-100"
        />
      </div>
    </div>
  );
};

export default ImportDetail;