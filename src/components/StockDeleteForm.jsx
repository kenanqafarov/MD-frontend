"use client";

import { useState, useEffect } from "react";
import CustomDropdown from "./CustomDropdown";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faCheck,
  faPlus,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import MultiFileForm from "./MultiFileForm";
import ListWithSubtotal from "../components/list/ListwithSubtotal";
import EditIcon from "../assets/icons/Edit";
import DeleteIcon from "../assets/icons/Delete";
import { useNavigate, useParams } from "react-router-dom";
import useWarehouseDeletionStore from "../../stores/warehouseDeletionStore";
import { useProductCategoryStore } from "../../stores/productCategories";
import { useProductStore } from "../../stores/productStore";
import useWarehouseEntryStore from "../../stores/warehouseEntryStore";
import axiosInstance from "../api/temp-axios-auth";

const StockDeleteForm = ({
  initialData,
  mode = "create",
  onSubmit,
  onCancel,
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: initialData,
  });

  // Store-lardan state-ləri götürürük
  const {
    createDeletion,
    updateDeletion,
    deleteDeletion,
    selectedDeletion,
    loading,
  } = useWarehouseDeletionStore();

  const { entries, fetchWarehouseEntries } = useWarehouseEntryStore();
  const { products, fetchProducts } = useProductStore();
  const { categories, fetchCategories } = useProductCategoryStore();

  const [warehouseProducts, setWarehouseProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState({
    warehouseEntryId: "",
    warehouseEntryProductId: "",
    productId: "",
    categoryId: "",
    quantity: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warehouseEntryProducts, setWarehouseEntryProducts] = useState([]);
  const [isLoadingEntryProducts, setIsLoadingEntryProducts] = useState(false);

  // Form məlumatlarını izləyirik
  const watchOrderDate = watch("orderDate");
  const watchOrderTime = watch("orderTime");

  // Komponent yüklənəndə store-lardan məlumatları çəkirik
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await fetchWarehouseEntries();
        await fetchProducts();
        await fetchCategories();

        if ((mode === "edit" || mode === "view") && id) {
          try {
            const deletionResponse = await axiosInstance.get(
              `/deletion-from-warehouse/info/${id}`
            );
            const deletionData = deletionResponse.data;

            setValue("orderDate", deletionData.date);

            // Backend-dən gələn saatı input[type=time] formatına çevir
            if (deletionData.time) {
              let timeValue = "00:00";
              if (typeof deletionData.time === "string") {
                timeValue = deletionData.time.substring(0, 5);
              } else if (deletionData.time.hour !== undefined) {
                timeValue = `${deletionData.time.hour
                  .toString()
                  .padStart(2, "0")}:${deletionData.time.minute
                  .toString()
                  .padStart(2, "0")}`;
              }
              setValue("orderTime", timeValue);
            }

            setValue("note", deletionData.description);

            if (deletionData.deletionFromWarehouseProductRequests) {
              const formattedProducts =
                deletionData.deletionFromWarehouseProductRequests.map(
                  (item) => {
                    const product = products.find(
                      (p) => p.id === item.productId
                    );
                    const category = categories.find(
                      (c) => c.id === item.categoryId
                    );

                    return {
                      warehouseEntryId: item.warehouseEntryId,
                      warehouseEntryProductId: item.warehouseEntryProductId,
                      productId: item.productId,
                      categoryId: item.categoryId,
                      quantity: item.quantity,
                      productName: product?.name || "Naməlum",
                      categoryName: category?.name || "Naməlum",
                      availableQuantity: 0,
                    };
                  }
                );

              setWarehouseProducts(formattedProducts);
            }
          } catch (error) {
            console.error("Error fetching deletion data:", error);
            alert("Silinmə məlumatlarını yükləyərkən xəta baş verdi.");
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response?.status === 401) {
          alert("Giriş icazəniz yoxdur. Zəhmət olmasa yenidən daxil olun.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [
    id,
    mode,
    setValue,
    fetchWarehouseEntries,
    fetchProducts,
    fetchCategories,
  ]);

  // InitialData dəyişəndə formu resetləyirik
  useEffect(() => {
    if (initialData) {
      reset(initialData);
      if (initialData.products) {
        setWarehouseProducts(initialData.products);
      }
    }
  }, [initialData, reset]);

  const handleProductChange = (field, value) => {
    setCurrentProduct((prev) => ({
      ...prev,
      [field]: value,
      // Əgər anbar girişi dəyişirsə, digər məlumatları sıfırla
      ...(field === "warehouseEntryId"
        ? {
            warehouseEntryProductId: "",
            productId: "",
            categoryId: "",
            quantity: "",
          }
        : {}),
    }));
  };

  const fetchWarehouseEntryProducts = async (warehouseEntryId) => {
    setIsLoadingEntryProducts(true);
    try {
      const infoResponse = await axiosInstance.get(
        `/warehouse-entry/info/${warehouseEntryId}`
      );

      if (
        infoResponse.data &&
        Array.isArray(infoResponse.data.warehouseEntryProducts)
      ) {
        return infoResponse.data.warehouseEntryProducts.map((product) => ({
          value: product.id,
          label: `${product.productName || "Məhsul"} (Qalıq: ${
            product.quantity
          })`,
          productId: product.productId,
          categoryId: product.categoryId,
          quantity: product.quantity,
          productName: product.productName,
          categoryName: product.categoryName,
        }));
      }

      return [];
    } catch (error) {
      console.error("Error fetching warehouse entry products:", error);
      return [];
    } finally {
      setIsLoadingEntryProducts(false);
    }
  };

  const handleWarehouseEntryChange = async (option) => {
    try {
      const warehouseEntryId = option.value;
      handleProductChange("warehouseEntryId", warehouseEntryId);
      handleProductChange("warehouseEntryProductId", "");

      const entryProducts = await fetchWarehouseEntryProducts(warehouseEntryId);
      setWarehouseEntryProducts(entryProducts);

      if (entryProducts.length === 0) {
        alert("Bu anbar girişi üçün məhsul tapılmadı!");
      }
    } catch (error) {
      console.error("Error handling warehouse entry change:", error);
      setWarehouseEntryProducts([]);
    }
  };

  const handleWarehouseEntryProductChange = (option) => {
    const entryProduct = warehouseEntryProducts.find(
      (p) => p.value.toString() === option.value.toString()
    );

    if (entryProduct) {
      handleProductChange("warehouseEntryProductId", option.value.toString());
      handleProductChange("productId", entryProduct.productId.toString());
      handleProductChange("categoryId", entryProduct.categoryId.toString());
    }
  };

  const handleAddProduct = () => {
    if (
      currentProduct.warehouseEntryId &&
      currentProduct.warehouseEntryProductId &&
      currentProduct.quantity
    ) {
      const selectedWarehouseEntryProduct = warehouseEntryProducts.find(
        (prod) =>
          prod.value.toString() ===
          currentProduct.warehouseEntryProductId.toString()
      );

      if (!selectedWarehouseEntryProduct) {
        alert("Seçilmiş anbar məhsulu tapılmadı. Zəhmət olmasa yenidən seçin.");
        return;
      }

      // Məhsul və kateqoriya məlumatlarını əldə et
      const selectedProduct = products.find(
        (p) =>
          p.id.toString() === selectedWarehouseEntryProduct.productId.toString()
      );
      const selectedCategory = categories.find(
        (c) =>
          c.id.toString() ===
          selectedWarehouseEntryProduct.categoryId.toString()
      );

      const newProduct = {
        warehouseEntryId: parseInt(currentProduct.warehouseEntryId),
        warehouseEntryProductId: parseInt(
          currentProduct.warehouseEntryProductId
        ),
        productId: parseInt(selectedWarehouseEntryProduct.productId),
        categoryId: parseInt(selectedWarehouseEntryProduct.categoryId),
        quantity: parseInt(currentProduct.quantity),
        productName:
          selectedProduct?.name ||
          selectedWarehouseEntryProduct.productName ||
          selectedWarehouseEntryProduct.label.split(" (")[0] ||
          "Naməlum",
        categoryName:
          selectedCategory?.name ||
          selectedWarehouseEntryProduct.categoryName ||
          "Naməlum",
        availableQuantity: selectedWarehouseEntryProduct.quantity,
      };

      setWarehouseProducts((prev) => [...prev, newProduct]);
      setCurrentProduct({
        warehouseEntryId: "",
        warehouseEntryProductId: "",
        productId: "",
        categoryId: "",
        quantity: "",
      });
      setWarehouseEntryProducts([]);
    } else {
      alert(
        "Zəhmət olmasa anbar girişini, anbar məhsulunu və miqdarı daxil edin"
      );
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Saatı backend-in gözlədiyi formatda hazırlamaq (string formatında)
      // Backend "HH:mm:ss" formatında string gözləyir
      const timeString = data.orderTime ? `${data.orderTime}:00` : "00:00:00";

      const formData = {
        date: data.orderDate,
        time: timeString, // String formatında saat
        description: data.note,
        deletionFromWarehouseProductRequests: warehouseProducts.map(
          (product) => ({
            warehouseEntryId: product.warehouseEntryId,
            warehouseEntryProductId: product.warehouseEntryProductId,
            productId: product.productId,
            categoryId: product.categoryId,
            quantity: product.quantity,
          })
        ),
      };

      console.log("Sending data to backend:", formData);

      let response;
      if (mode === "create") {
        response = await axiosInstance.post(
          "/deletion-from-warehouse/create",
          formData
        );
      } else if (mode === "edit") {
        response = await axiosInstance.put(
          `/deletion-from-warehouse/update/${id}`,
          formData
        );
      }

      alert(
        mode === "create"
          ? "Silinmə uğurla yaradıldı!"
          : "Silinmə uğurla yeniləndi!"
      );

      if (onSubmit) {
        onSubmit(formData);
      }

      if (mode === "create") {
        navigate("/stock/delete");
      }
    } catch (error) {
      console.error("Form göndərilərkən xəta baş verdi:", error);

      let errorMessage = "Xəta baş verdi: ";
      if (error.response?.status === 401) {
        errorMessage =
          "Giriş icazəniz yoxdur. Zəhmət olmasa yenidən daxil olun.";
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Naməlum xəta";
      }

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = (index) => {
    setWarehouseProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditProduct = (product, index) => {
    setCurrentProduct({
      warehouseEntryId: product.warehouseEntryId.toString(),
      warehouseEntryProductId: product.warehouseEntryProductId.toString(),
      productId: product.productId.toString(),
      categoryId: product.categoryId.toString(),
      quantity: product.quantity.toString(),
    });

    // Seçilmiş anbar girişinə aid məhsulları yüklə
    if (product.warehouseEntryId) {
      fetchWarehouseEntryProducts(product.warehouseEntryId)
        .then((entryProducts) => {
          setWarehouseEntryProducts(entryProducts);
        })
        .catch((error) => {
          console.error("Error fetching warehouse entry products:", error);
        });
    }

    handleDeleteProduct(index);
  };

  const handleDelete = async () => {
    if (
      window.confirm("Bu silinmə əməliyyatını silmək istədiyinizə əminsiniz?")
    ) {
      try {
        await axiosInstance.delete(`/deletion-from-warehouse/delete/${id}`);
        alert("Silinmə uğurla silindi!");
        if (onCancel) {
          onCancel();
        } else {
          navigate("/stock/delete");
        }
      } catch (error) {
        console.error("Silinmə zamanı xəta baş verdi:", error);

        if (error.response?.status === 401) {
          alert("Giriş icazəniz yoxdur. Zəhmət olmasa yenidən daxil olun.");
        } else {
          alert(
            "Silinmə zamanı xəta baş verdi: " +
              (error.response?.data?.message || error.message)
          );
        }
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate("/stock/delete");
    }
  };

  const columns = [
    {
      key: "categoryName",
      label: "Kategoriya",
    },
    {
      key: "productName",
      label: "Məhsul",
    },
    {
      key: "quantity",
      label: "Miqdar",
    },
    {
      key: "availableQuantity",
      label: "Mövcud Miqdar",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          className="text-3xl text-blue-500"
        />
        <span className="ml-2">Yüklənir...</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col gap-2"
    >
      {mode === "view" && (
        <div className="flex self-end gap-2">
          <button
            type="button"
            onClick={() => navigate("edit")}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <EditIcon />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <DeleteIcon />
          </button>
        </div>
      )}

      <div className="flex justify-between items-center gap-2">
        <label htmlFor="orderDate">
          Sifariş tarixi <span className="text-red-500">*</span>
        </label>
        <div className="w-[950px]">
          <input
            id="orderDate"
            type="date"
            {...register("orderDate", {
              required: "Sifariş tarixi daxil edilməlidir.",
              validate: (value) => {
                const year = new Date(value).getFullYear();
                if (year >= 1800 && year <= 3000) {
                  return true;
                }
                return "İl 1800-dən kiçik və ya 3000-dən böyük ola bilməz.";
              },
            })}
            readOnly={mode === "view"}
            className={`w-[950px] h-10 border border-[#D4DCE8] rounded-lg px-4 py-2 ${
              mode === "view" ? "bg-gray-200" : ""
            }`}
            disabled={isLoading}
          />
          {errors.orderDate && (
            <p className="text-red-500 text-sm mt-1">
              {errors.orderDate.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center gap-2">
        <label htmlFor="orderTime">
          Saat <span className="text-red-500">*</span>
        </label>
        <div className="w-[950px]">
          <input
            id="orderTime"
            type="time"
            {...register("orderTime", { required: true })}
            readOnly={mode === "view"}
            className={`w-[950px] h-10 border border-[#D4DCE8] rounded-lg px-4 py-2 ${
              mode === "view" ? "bg-gray-200" : ""
            }`}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex justify-between items-center gap-2">
        <label htmlFor="typeCount">
          Çeşid sayı <span className="text-red-500">*</span>
        </label>
        <div className="w-[950px]">
          <input
            id="typeCount"
            type="number"
            value={warehouseProducts.length}
            readOnly
            className="w-[950px] h-10 border border-[#D4DCE8] rounded-lg px-4 py-2 bg-gray-200"
          />
        </div>
      </div>

      <div className="flex justify-between items-center gap-2">
        <label htmlFor="note">
          Qeyd <span className="text-red-500">*</span>
        </label>
        <div className="w-[950px]">
          <textarea
            id="note"
            {...register("note", { required: true })}
            readOnly={mode === "view"}
            className={`w-[950px] h-25 border border-[#D4DCE8] rounded-lg px-4 py-2 ${
              mode === "view" ? "bg-gray-200" : ""
            }`}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {mode !== "view" && (
          <div className="flex justify-between items-center gap-2">
            <label htmlFor="products">Məhsullar</label>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex flex-col gap-2">
                <label htmlFor="warehouseEntry">
                  Anbar Girişi <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentProduct.warehouseEntryId}
                  onChange={(e) => {
                    const selectedOption = entries?.find(
                      (entry) => entry.id.toString() === e.target.value
                    );
                    if (selectedOption) {
                      handleWarehouseEntryChange({ value: e.target.value });
                    }
                  }}
                  disabled={isLoading}
                  className="h-10 border border-[#D4DCE8] rounded-lg px-4 py-2"
                >
                  <option value="">Anbar girişi seçin</option>
                  {entries?.map((entry) => (
                    <option key={entry.id} value={entry.id.toString()}>
                      Giriş #{entry.id} ({entry.date})
                    </option>
                  ))}
                </select>
              </div>

              {isLoadingEntryProducts ? (
                <div className="flex flex-col gap-2">
                  <label>Anbar Məhsulu</label>
                  <div className="h-10 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faSpinner}
                      spin
                      className="text-blue-500"
                    />
                    <span className="ml-2">Yüklənir...</span>
                  </div>
                </div>
              ) : warehouseEntryProducts.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <label htmlFor="warehouseEntryProduct">
                    Anbar Məhsulu <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={currentProduct.warehouseEntryProductId}
                    onChange={(e) => {
                      const selectedOption = warehouseEntryProducts.find(
                        (p) => p.value.toString() === e.target.value
                      );
                      if (selectedOption) {
                        handleWarehouseEntryProductChange({
                          value: e.target.value,
                        });
                      }
                    }}
                    disabled={!currentProduct.warehouseEntryId || isLoading}
                    className="h-10 border border-[#D4DCE8] rounded-lg px-4 py-2"
                  >
                    <option value="">Məhsul seçin</option>
                    {warehouseEntryProducts.map((product) => (
                      <option key={product.value} value={product.value}>
                        {product.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : currentProduct.warehouseEntryId ? (
                <div className="flex flex-col gap-2">
                  <label>Anbar Məhsulu</label>
                  <div className="h-10 flex items-center justify-center text-red-500">
                    Bu anbar girişi üçün məhsul tapılmadı!
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-2">
                <label htmlFor="quantity">
                  Miqdar <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className="h-10 border border-[#D4DCE8] rounded-lg px-4 py-2"
                  value={currentProduct.quantity}
                  onChange={(e) =>
                    handleProductChange("quantity", e.target.value)
                  }
                  max={
                    warehouseEntryProducts.find(
                      (p) =>
                        p.value.toString() ===
                        currentProduct.warehouseEntryProductId.toString()
                    )?.quantity || 0
                  }
                  min="1"
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col gap-2">
                <br />
                <button
                  type="button"
                  onClick={handleAddProduct}
                  disabled={
                    isLoading ||
                    !currentProduct.warehouseEntryId ||
                    !currentProduct.warehouseEntryProductId ||
                    !currentProduct.quantity
                  }
                  className="flex items-center justify-center px-4 py-2 border text-[#155EEF] bg-[#155EEF] text-white rounded-lg hover:bg-[#1046b8] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed w-[184px] h-[44px] gap-2"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Məhsul əlavə et
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end items-center gap-2">
          <div className="w-[950px]">
            <ListWithSubtotal
              columns={columns}
              data={warehouseProducts}
              subtotalColumns={[]}
              enableEdit={mode !== "view"}
              enableDelete={mode !== "view"}
              handleEdit={handleEditProduct}
              handleDelete={handleDeleteProduct}
            />

            {warehouseProducts.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                Hələ heç bir məhsul əlavə edilməyib
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center gap-2">
        <label htmlFor="documents">Sənədlər</label>
        <div className="w-[950px]">
          <MultiFileForm mode={mode} />
        </div>
      </div>

      {mode !== "view" && (
        <div className="self-end flex gap-4 m-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex items-center justify-center px-4 py-2 border text-[#155EEF] border-[#155EEF] rounded-lg hover:bg-gray-100 w-[184px] h-[44px] gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faXmark} />
            Ləğv et
          </button>
          <button
            type="submit"
            disabled={
              isSubmitting || warehouseProducts.length === 0 || isLoading
            }
            className="flex items-center justify-center px-4 py-2 bg-[#155EEF] text-white rounded-lg hover:bg-[#1046b8] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed w-[184px] h-[44px] gap-2"
          >
            {isSubmitting ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                Göndərilir...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCheck} />
                Yadda saxla
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
};

export default StockDeleteForm;