import React, { useEffect, useState, useMemo } from "react";
import SimpleList from "../../components/list/SimpleList";
import SearchIcon from "../../assets/icons/Search";
import CustomDropdown from "../../components/CustomDropdown";
import DownloadIcon from "../../assets/icons/Download";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal"; 

import useWarehouseEntryStore from "../../../stores/warehouseEntryStore";
import { useProductCategoryStore } from "../../../stores/productCategories";
import { useProductStore } from "../../../stores/productStore";

const StockImport = () => {
 const {
  fetchWarehouseEntries,
  searchEntries,
  entries,
  searchedEntries,
  deleteEntry,
 } = useWarehouseEntryStore();

 const { fetchCategories, categories } = useProductCategoryStore();
 const { fetchProducts, products } = useProductStore();

 const [searchDate, setSearchDate] = useState("");
 const [searchTime, setSearchTime] = useState("");
 const [selectedEntryId, setSelectedEntryId] = useState(null);
 const [entryDetails, setEntryDetails] = useState(null);
 const [showModal, setShowModal] = useState(false);
 const [entryToDelete, setEntryToDelete] = useState(null);

 const navigate = useNavigate();

 useEffect(() => {
  const loadInitialData = async () => {
   await fetchWarehouseEntries();
   await fetchCategories();
   await fetchProducts();
  };
  loadInitialData();
 }, []);

 const handleSearch = async () => {
  const searchData = {};
  if (searchDate) {
   searchData.date = searchDate;
  }
  if (searchTime) {
   // Saat və dəqiqəni HH:mm:ss formatına çeviririk
   const [hour, minute] = searchTime.split(":");
   searchData.time = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
  }

  if (Object.keys(searchData).length > 0) {
   await searchEntries(searchData);
  } else {
   await fetchWarehouseEntries();
  }
  clearSelection();
 };

 const handleKeyPress = (e) => {
  if (e.key === "Enter") {
   handleSearch();
  }
 };

 const clearSelection = () => {
  setSelectedEntryId(null);
  setEntryDetails(null);
 };

 const fetchEntryDetail = async (id) => {
  try {
   const res = await fetch(
    `${import.meta.env.VITE_BASE_URL}/warehouse-entry/info/${id}`,
    {
     headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
     },
    }
   );
   const data = await res.json();
   setEntryDetails(data);
  } catch (error) {
   console.error("Entry detalları alınmadı", error);
   setEntryDetails(null);
  }
 };

 const handleEntrySelect = (id) => {
  setSelectedEntryId(id);
  fetchEntryDetail(id);
 };

 const handleDelete = (id) => {
  setEntryToDelete(id);
  setShowModal(true);
 };

 const handleConfirmDelete = async () => {
  if (!entryToDelete) return;
  try {
   await deleteEntry(entryToDelete);
   await fetchWarehouseEntries();
   if (selectedEntryId === entryToDelete) {
    clearSelection();
   }
  } catch (err) {
   alert("Silərkən xəta baş verdi!");
   console.error(err);
  } finally {
   setShowModal(false);
   setEntryToDelete(null);
  }
 };

 const handleEdit = (id) => navigate(`/stock/import/edit/${id}`);
 const handleView = (id) => navigate(`/stock/import/${id}`);

 const getDateTime = (dateStr, timeObj) => {
  if (!dateStr || !timeObj) return null;
  const hour = timeObj.hour?.toString().padStart(2, "0") || "00";
  const minute = timeObj.minute?.toString().padStart(2, "0") || "00";
  return new Date(`${dateStr}T${hour}:${minute}`);
 };

 const formatTime = (dt) => {
  if (!dt) return "-";
  return dt.toTimeString().slice(0, 5);
 };

 const dataToShow = useMemo(
  () => (searchDate || searchTime ? searchedEntries : entries) || [],
  [searchDate, searchTime, searchedEntries, entries]
 );

 const getCategoryName = (categoryId) =>
  categories.find((c) => c.id === categoryId)?.categoryName || "-";

 const detailData = useMemo(() => {
  return (entryDetails?.warehouseEntryProducts || []).map((item) => {
   const product = products.find((p) => p.id === item.productId);
   return {
    ...item,
    productName: product?.productName || "-",
    productTitle: product?.productCode || "-",
    categoryName: getCategoryName(product?.categoryId),
   };
  });
 }, [entryDetails, products, categories]);

 const calculateTotalQuantity = (row) => {
  return (row.warehouseEntryProducts || []).reduce(
   (sum, item) => sum + (item.quantity || 0),
   0
  );
 };

 const listColumns = [
  {
   key: "date",
   label: "Tarix",
   render: (row) => {
    const dt = getDateTime(row.date, row.time);
    return dt ? dt.toLocaleDateString("az-AZ") : "-";
   },
  },
  {
   key: "time",
   label: "Saat",
   render: (row) => {
    const dt = getDateTime(row.date, row.time);
    return formatTime(dt);
   },
  },
  {
    key: "number",
    label: "Çeşid sayı",
  }
  ,
  { key: "sumPrice", label: "Ümumi məbləğ" },
 ];

 const detailColumns = [
  { key: "categoryName", label: "Kategoriyası" },
  { key: "productName", label: "Məhsulun adı" },
  { key: "productTitle", label: "Məhsulun kodu" },
  { key: "quantity", label: "Məhsulun sayı" },
 ];

 return (
  <div className="flex flex-col border border-gray-200 rounded-lg bg-white p-4 gap-4 h-screen">
   {/* Search and Controls */}
   <div className="flex justify-between items-center gap-2">
    <div className="flex items-center gap-2 flex-1">
     <input
      type="date"
      value={searchDate}
      onChange={(e) => setSearchDate(e.target.value)}
      className="w-full p-2 rounded-lg border border-gray-300"
     />
     <input
      type="time"
      value={searchTime}
      onChange={(e) => setSearchTime(e.target.value)}
      className="w-full p-2 rounded-lg border border-gray-300"
     />
     <button onClick={handleSearch}>
      <SearchIcon />
     </button>
    </div>
    <div className="flex items-center gap-8">
     <button
      className="bg-[#155EEF] text-white px-4 py-2 rounded-lg"
      onClick={() => navigate("/stock/import/add")}>
      Yenisini əlavə et
     </button>
     <button onClick={() => console.log("Yükləmə funksiyası əlavə olunmalıdır")}>
      <DownloadIcon />
     </button>
    </div>
   </div>

   {/* Entry List */}
   <div>
    <h2 className="font-semibold mb-2">Anbar Girişləri</h2>
    <SimpleList
     columns={listColumns}
     data={dataToShow}
     onRowClick={(row) => handleEntrySelect(row.id)}
     selectedRowId={selectedEntryId}
     enableDelete={true}
     enableEdit={true}
     enableView={true}
     handleView={handleView}
     handleEdit={handleEdit}
     handleDelete={handleDelete}
    />
   </div>

   {/* Entry Details */}
   {selectedEntryId && entryDetails && (
    <div className="pt-4">
     <h2 className="font-semibold mb-4">
      Seçilmiş Girişin Məlumatları (ID: {selectedEntryId})
     </h2>
     <div className="grid grid-cols-4 gap-4 mb-4">
      <div>
       <strong>Tarix:</strong>{" "}
       {entryDetails.date && entryDetails.time
        ? getDateTime(entryDetails.date, entryDetails.time).toLocaleDateString("az-AZ")
        : "-"}
      </div>
      <div>
       <strong>Saat:</strong>{" "}
       {entryDetails.date && entryDetails.time
        ? formatTime(getDateTime(entryDetails.date, entryDetails.time))
        : "-"}
      </div>
      <div>
       <strong>Cəmi məbləğ:</strong>{" "}
       {entryDetails.totalAmount || entryDetails.sumPrice || "0 ₼"}
      </div>
      <div>
       <strong>Toplam məhsul sayı:</strong>{" "}
       {(entryDetails.warehouseEntryProducts || []).reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
       )}
      </div>
     </div>

     <SimpleList
      columns={detailColumns}
      data={detailData}
      enableDelete={false}
      enableEdit={false}
      enableView={false}
      className="mt-4"
     />
    </div>
   )}
   
   {/* Modal Komponenti */}
   <Modal 
    isOpen={showModal}
    onClose={() => setShowModal(false)}
    title="Silməni təsdiqləyin"
    message="Bu anbar girişini silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz."
    onConfirm={handleConfirmDelete}
    confirmText="Sil"
    confirmButtonClass="delete-button"
   />
  </div>
 );
};

export default StockImport;