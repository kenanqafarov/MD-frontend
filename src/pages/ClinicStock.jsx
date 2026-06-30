import React, { useEffect, useState } from "react";
import SimpleList from "../components/list/SimpleList";
import SearchIcon from "../assets/icons/Search";
import CustomDropdown from "../components/CustomDropdown";
import DownloadIcon from "../assets/icons/Download";
import useWarehouseStoreClinic from "../../stores/warehouseClinic";

const ClinicStock = () => {
  const {
    warehouseData,
    loading,
    error,
    searchTerm,
    selectedCategory,
    setSearchTerm,
    setSelectedCategory,
    fetchWarehouseData,
  } = useWarehouseStoreClinic();

  const [filteredData, setFilteredData] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([
    { value: "", label: "Bütün Kateqoriyalar" },
  ]);

  useEffect(() => {
    fetchWarehouseData();
  }, [fetchWarehouseData]);

  useEffect(() => {
    if (warehouseData && warehouseData.length > 0) {
      const categories = [
        ...new Set(warehouseData.map((item) => item.categoryName)),
      ];
      const newCategoryOptions = [
        { value: "", label: "Bütün Kateqoriyalar" },
        ...categories.map((cat) => ({ value: cat, label: cat })),
      ];
      setCategoryOptions(newCategoryOptions);
    }
  }, [warehouseData]);

  useEffect(() => {
    const dataToFilter = warehouseData || [];
    const lowercasedSearchTerm = searchTerm.toLowerCase();

    const result = dataToFilter.filter((item) => {
      const categoryMatch = selectedCategory ? item.categoryName === selectedCategory : true;
      
      // Məhsul adı və ya kodu boş olarsa və ya string deyilsə xəta verməməsi üçün yoxlama əlavə edildi
      const productName = typeof item.productName === 'string' ? item.productName.toLowerCase() : '';
      const productNo = typeof item.productNo === 'string' ? item.productNo.toLowerCase() : '';

      const termMatch = lowercasedSearchTerm
        ? productName.includes(lowercasedSearchTerm) ||
          productNo.includes(lowercasedSearchTerm)
        : true;

      return categoryMatch && termMatch;
    });

    setFilteredData(result);
  }, [warehouseData, searchTerm, selectedCategory]);

  const columns = [
    {
      key: "categoryName",
      label: "Kategoriyası",
    },
    {
      key: "productName",
      label: "Məhsulun adı",
    },
    {
      key: "productNo",
      label: "Məhsulun kodu",
    },
    {
      key: "sumQuantity",
      label: "Məhsulun Sayı",
    },
  ];

  const handleDownload = () => {
    console.log("Download button clicked");
    alert("Download functionality to be implemented.");
  };

  return (
    <div className="flex flex-col border border-gray-200 rounded-lg bg-white p-3 h-screen">
      <div className="flex justify-between items-center gap-2 p-2">
        <div className="flex items-center gap-2">
          <CustomDropdown
            options={categoryOptions}
            value={selectedCategory}
            onChange={(option) => setSelectedCategory(option.value)}
          />
          <input
            type="text"
            placeholder="Axtarış..."
            className="w-full p-2 rounded-lg border border-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="p-2 border border-gray-300 rounded-lg" onClick={handleDownload}>
          <DownloadIcon />
        </button>
      </div>

      {loading && <p className="text-center py-4">Məlumatlar yüklənir...</p>}
      {error && <p className="text-center py-4 text-red-500">Xəta baş verdi: {error.message}</p>}
      {!loading && !error && (
        <SimpleList columns={columns} data={filteredData} />
      )}
    </div>
  );
};

export default ClinicStock;