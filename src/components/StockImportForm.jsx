import { useState, useEffect } from "react";
import CustomDropdown from "./CustomDropdown";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPlus } from "@fortawesome/free-solid-svg-icons";
import ListWithSubtotal from "../components/list/ListwithSubtotal";
import EditIcon from "../assets/icons/Edit";
import DeleteIcon from "../assets/icons/Delete";
import { useNavigate } from "react-router-dom";
import useWarehouseEntryStore from "../../stores/warehouseEntryStore";
import axiosInstance from "../api/temp-axios-auth";

// Min və max tarix limitlərini təyin edirik
const MIN_DATE = '1900-01-01';
const MAX_DATE = '3000-12-31';

const StockImportForm = ({
  initialData,
  mode = "create",
  onSubmit,
  onCancel,
}) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {},
  });

  const { createEntry } = useWarehouseEntryStore();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [productList, setProductList] = useState([]);
  const [currentProduct, setCurrentProduct] = useState({
    category: "",
    name: "",
    quantity: "",
    price: "",
  });
  const [sumPrice, setSumPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  // Table columns for product list
  const columns = [
    { key: "categoryName", label: "Kategoriya" },
    { key: "productName", label: "Məhsul" },
    { key: "quantity", label: "Miqdar" },
    { key: "price", label: "Qiymət" },
  ];

  // Calculate sumPrice whenever productList changes
  useEffect(() => {
    const total = productList.reduce((sum, product) => {
      return (
        sum +
        (Number.parseFloat(product.price) || 0) *
          (Number.parseInt(product.quantity) || 0)
      );
    }, 0);
    setSumPrice(total);
  }, [productList]);

  // Load categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/product-category/read");

        const formattedCategories = response.data.map((category) => ({
          value: category.id,
          label: category.categoryName,
        }));
        setCategories(formattedCategories);
      } catch (error) {
        console.error("Error loading categories:", error);
        if (error.response?.status === 401) {
          alert("Giriş icazəniz yoxdur. Zəhmət olmasa yenidən daxil olun.");
        } else {
          alert(
            "Kateqoriyalar yüklənərkən xəta baş verdi: " +
              (error.response?.data?.message || error.message)
          );
        }
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      if (currentProduct.category) {
        try {
          setLoading(true);
          const response = await axiosInstance.get("/product/read");

          const filteredProducts = response.data
            .filter((product) => product.categoryId === currentProduct.category)
            .map((product) => ({
              value: product.id,
              label: product.productName,
            }));
          setProducts(filteredProducts);
        } catch (error) {
          console.error("Error loading products:", error);
          if (error.response?.status === 401) {
            alert("Giriş icazəniz yoxdur. Zəhmət olmasa yenidən daxil olun.");
          } else {
            alert(
              "Məhsullar yüklənərkən xəta baş verdi: " +
                (error.response?.data?.message || error.message)
            );
          }
        } finally {
          setLoading(false);
        }
      }
    }
    loadProducts();
  }, [currentProduct.category]);

  const handleAddProduct = () => {
    const { category, name, quantity, price } = currentProduct;
    if (!category || !name || !quantity || !price) {
      alert("Zəhmət olmasa bütün məhsul məlumatlarını doldurun");
      return;
    }

    const categoryObj = categories.find((c) => c.value === category);
    const productObj = products.find((p) => p.value === name);

    const newProduct = {
      id: Date.now() + Math.random(),
      category: category,
      name: name,
      quantity: quantity,
      price: price,
      categoryName: categoryObj?.label || "",
      productName: productObj?.label || "",
    };

    setProductList((prev) => [...prev, newProduct]);
    setCurrentProduct({
      category: "",
      name: "",
      quantity: "",
      price: "",
    });
  };

  const handleEditProduct = (product) => {
    setCurrentProduct({
      category: product.category,
      name: product.name,
      quantity: product.quantity,
      price: product.price,
    });
    setProductList((prev) => prev.filter((p) => p.id !== product.id));
  };

  const handleDeleteProduct = (id) => {
    setProductList((prev) => prev.filter((product) => product.id !== id));
  };

  const handleFormSubmit = async (data) => {
    if (productList.length === 0) {
      alert("Ən azı bir məhsul əlavə etməlisiniz");
      return;
    }

    try {
      setLoading(true);
      const formattedData = {
        date: data.orderDate,
        time: data.orderTime,
        warehouseEntryProductCreateRequests: productList.map((product) => ({
          categoryId: Number.parseInt(product.category),
          productId: Number.parseInt(product.name),
          quantity: Number.parseInt(product.quantity),
          price: Number.parseFloat(product.price),
        })),
        description: data.note,
      };

      console.log("Backend-ə göndəriləcək data:", formattedData);
      await createEntry(formattedData);

      if (onSubmit) {
        onSubmit(formattedData);
      } else {
        alert("Anbar girişi uğurla yaradıldı!");
        navigate("/stock/import");
      }
    } catch (error) {
      console.error("Xəta baş verdi:", error);
      if (error.response?.status === 401) {
        alert("Giriş icazəniz yoxdur. Zəhmət olmasa yenidən daxil olun.");
      } else {
        alert("Xəta: " + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    else navigate(-1);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col gap-4 p-4 max-w-[1000px] mx-auto">
      {loading && (
        <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-50">
          <div className="flex-col gap-4 w-full flex items-center justify-center">
            <div className="w-20 h-20 border-4 border-transparent text-blue-400 text-4xl animate-spin flex items-center justify-center border-t-blue-400 rounded-full">
              <div className="w-16 h-16 border-4 border-transparent text-red-400 text-2xl animate-spin flex items-center justify-center border-t-red-400 rounded-full" />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="orderDate" className="font-medium">
          Sifariş tarixi <span className="text-red-500">*</span>
        </label>
        <input
          id="orderDate"
          type="date"
          {...register("orderDate", {
            required: "Bu sahə tələb olunur",
            validate: (value) => {
              const selectedDate = new Date(value);
              const minLimit = new Date(MIN_DATE);
              const maxLimit = new Date(MAX_DATE);
              if (selectedDate < minLimit || selectedDate > maxLimit) {
                return `Zəhmət olmasa, tarixi ${MIN_DATE.substring(0, 4)} və ${MAX_DATE.substring(0, 4)} illəri aralığında seçin.`;
              }
              return true;
            },
          })}
          className={`w-full h-10 border rounded px-3 ${
            mode === "view" ? "bg-gray-200" : "bg-white"
          }`}
          disabled={mode === "view" || loading}
          // Brauzerin daxili validasiyasını da dəstəkləyirik
          min={MIN_DATE}
          max={MAX_DATE}
        />
        {errors.orderDate && (
          <span className="text-red-500 text-sm">
            {errors.orderDate.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="orderTime" className="font-medium">
          Saat <span className="text-red-500">*</span>
        </label>
        <input
          id="orderTime"
          type="time"
          {...register("orderTime", { required: "Bu sahə tələb olunur" })}
          className={`w-full h-10 border rounded px-3 ${
            mode === "view" ? "bg-gray-200" : "bg-white"
          }`}
          disabled={mode === "view" || loading}
        />
        {errors.orderTime && (
          <span className="text-red-500 text-sm">
            {errors.orderTime.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="typeCount" className="font-medium">
          Çeşid sayı <span className="text-red-500">*</span>
        </label>
        <input
          id="typeCount"
          type="number"
          {...register("typeCount", { required: "Bu sahə tələb olunur" })}
          className={`w-full h-10 border rounded px-3 ${
            mode === "view" ? "bg-gray-200" : "bg-white"
          }`}
          disabled={mode === "view" || loading}
        />
        {errors.typeCount && (
          <span className="text-red-500 text-sm">
            {errors.typeCount.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="note" className="font-medium">
          Qeyd <span className="text-red-500">*</span>
        </label>
        <textarea
          id="note"
          {...register("note", { required: "Bu sahə tələb olunur" })}
          rows={4}
          className={`w-full border rounded px-3 py-2 resize-none ${
            mode === "view" ? "bg-gray-200" : "bg-white"
          }`}
          disabled={mode === "view" || loading}
        />
        {errors.note && (
          <span className="text-red-500 text-sm">{errors.note.message}</span>
        )}
      </div>

      {mode !== "view" && (
        <div className="border p-4 rounded bg-gray-50">
          <h3 className="mb-4 font-semibold">Məhsul əlavə et</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="flex flex-col">
              <label className="mb-1">Kategoriyası</label>
              <CustomDropdown
                options={categories}
                value={categories.find(
                  (c) => c.value === currentProduct.category
                )}
                onChange={(option) =>
                  setCurrentProduct((prev) => ({
                    ...prev,
                    category: option?.value || "",
                    name: "",
                  }))
                }
                placeholder="Kategoriya seçin"
                isDisabled={loading}
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1">Məhsulun adı</label>
              <CustomDropdown
                options={products}
                value={products.find((p) => p.value === currentProduct.name)}
                onChange={(option) =>
                  setCurrentProduct((prev) => ({
                    ...prev,
                    name: option?.value || "",
                  }))
                }
                placeholder="Məhsul seçin"
                isDisabled={!currentProduct.category || loading}
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1">Miqdar</label>
              <input
                type="number"
                value={currentProduct.quantity}
                onChange={(e) =>
                  setCurrentProduct((prev) => ({
                    ...prev,
                    quantity: e.target.value,
                  }))
                }
                className="h-10 border rounded px-3"
                min={1}
                disabled={loading}
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1">Qiymət</label>
              <input
                type="number"
                value={currentProduct.price}
                onChange={(e) =>
                  setCurrentProduct((prev) => ({
                    ...prev,
                    price: e.target.value,
                  }))
                }
                className="h-10 border rounded px-3"
                min={0}
                step="0.01"
                disabled={loading}
              />
            </div>

            <div>
              <button
                type="button"
                onClick={handleAddProduct}
                disabled={loading}
                className="w-full h-10 bg-blue-600 text-white rounded flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                <FontAwesomeIcon icon={faPlus} />
                Əlavə et
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <ListWithSubtotal
          data={productList}
          columns={columns}
          keyExtractor={(item) => item.id}
          mode={mode}
          handleEdit={handleEditProduct}
          handleDelete={handleDeleteProduct}
          subtotal={sumPrice}
          actions={(item) =>
            mode !== "view" && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEditProduct(item)}
                  title="Redaktə et"
                  className="p-1 hover:bg-gray-100 rounded"
                  disabled={loading}>
                  <EditIcon />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteProduct(item.id)}
                  title="Sil"
                  className="p-1 hover:bg-gray-100 rounded"
                  disabled={loading}>
                  <DeleteIcon />
                </button>
              </div>
            )
          }
        />
      </div>

      {mode !== "view" && (
        <div className="flex justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-6 py-2 border rounded border-gray-400 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
            Ləğv et
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <FontAwesomeIcon icon={faCheck} />
            Yadda saxla
          </button>
        </div>
      )}
    </form>
  );
};

export default StockImportForm;