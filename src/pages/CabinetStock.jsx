import React, { useEffect, useState } from "react";
import SimpleList from "../components/list/SimpleList";
import SearchIcon from "../assets/icons/Search";
import CustomDropdown from "../components/CustomDropdown";
import DownloadIcon from "../assets/icons/Download";
import useWarehouseStockRoomStore from "../../stores/warehouseStockRoom";
import useCalendarStore from "../../stores/calendarStore";

const CabinetStock = () => {
  // Məhsul məlumatları və axtarış state-ləri üçün zustand store
  const {
    cabinetStockData,
    loading,
    error,
    roomName,
    categoryName,
    productName,
    productNo,
    setRoomName,
    setCategoryName,
    setProductName,
    setProductNo,
    searchRoomStock,
  } = useWarehouseStockRoomStore();

  // Otaq məlumatları və onları çəkmək üçün zustand store
  const { rooms, fetchRooms } = useCalendarStore();

  const [categoryOptions, setCategoryOptions] = useState([
    { value: "", label: "Bütün Kateqoriyalar" },
  ]);

  // İlk renderdə otaqları və məhsul məlumatlarını çəkmək
  useEffect(() => {
    fetchRooms();
    searchRoomStock();
  }, [fetchRooms, searchRoomStock]);

  // Məhsul məlumatları yeniləndikcə kateqoriya dropdown-u yeniləmək
  useEffect(() => {
    if (cabinetStockData && cabinetStockData.length > 0) {
      const categories = [
        ...new Set(cabinetStockData.map((item) => item.category)),
      ];
      const newCategoryOptions = [
        { value: "", label: "Bütün Kateqoriyalar" },
        ...categories.map((cat) => ({ value: cat, label: cat })),
      ];
      setCategoryOptions(newCategoryOptions);
    }
  }, [cabinetStockData]);

  // Otaq siyahısını dropdown üçün formatlamaq
  const roomOptions = rooms.map((room) => ({
    value: room.cabinetName,
    label: room.cabinetName,
  }));
  // "Bütün Otaqlar" opsiyasını əlavə etmək
  const allRoomsOption = { value: "", label: "Bütün Otaqlar" };
  const allRoomOptions = [allRoomsOption, ...roomOptions];

  const columns = [
    {
      key: "category",
      label: "Kategoriyası",
    },
    {
      key: "name",
      label: "Məhsulun adı",
    },
    {
      key: "code",
      label: "Məhsulun kodu",
    },
    {
      key: "entryQuantity",
      label: "Mədaxil",
    },
    {
      key: "usedQuantity",
      label: "İstifadə",
    },
    {
      key: "remainingQuantity",
      label: "Qalıq",
    },
  ];

  const handleSearch = () => {
    searchRoomStock();
  };

  const handleDownload = () => {
    console.log("Download button clicked");
    alert("Download functionality needs to be implemented.");
  };

  const handleProductNoChange = (e) => {
    const value = e.target.value;
    setProductNo(value === "" ? null : parseInt(value, 10));
  };

  return (
    <div className="flex flex-col border border-gray-200 rounded-lg bg-white p-1 h-screen">
      <div className="flex flex-wrap justify-between items-center gap-2 p-2">
        <div className="flex items-center gap-2 ">
          <CustomDropdown
            options={allRoomOptions}
            value={roomName}
            onChange={(option) => {
              setRoomName(option.value);
              searchRoomStock();
            }}
            placeholder="Otaq Seçin..."
          />
          <CustomDropdown
            options={categoryOptions}
            value={categoryName}
            onChange={(option) => {
              setCategoryName(option.value);
              searchRoomStock();
            }}
            placeholder="Kateqoriya Seçin..."
          />
          <input
            type="text"
            placeholder="Məhsulun adı..."
            className="p-2 rounded-lg border border-gray-300 min-w-[150px]"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <input
            type="number"
            placeholder="Məhsulun kodu..."
            className="p-2 rounded-lg border border-gray-300 min-w-[150px]"
            value={productNo || ""}
            onChange={handleProductNoChange}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <button
            className="p-2 border border-gray-300 rounded-lg"
            onClick={handleSearch}>
            <SearchIcon />
          </button>
        </div>
        <button
          className="p-2 border border-gray-300 rounded-lg"
          onClick={handleDownload}>
          <DownloadIcon />
        </button>
      </div>

      {loading && <p className="text-center py-4">Məlumatlar yüklənir...</p>}
      {error && (
        <p className="text-center py-4 text-red-500">
          Xəta baş verdi: {error.message || error}
        </p>
      )}
      {!loading && !error && (
        <SimpleList columns={columns} data={cabinetStockData} />
      )}
    </div>
  );
};

export default CabinetStock;
